import Handlebars from "handlebars";
import ky, { type Options as KyOptions } from "ky";
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { tryParseHeaders } from "@/lib/utils";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type HttpRequestData = {
  headers?: string | Record<string, unknown> | null;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
  variableName: string;
};

export const HttpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  if (!data.endpoint) {
    throw new NonRetriableError("HTTP Request node: No endpoint configured");
  }

  if (!data.variableName) {
    throw new NonRetriableError(
      "HTTP Request node: No variable name configured"
    );
  }

  if (!data.method) {
    throw new NonRetriableError("HTTP Request node: Method not configured");
  }

  const result = await step.run("http-request", async () => {
    const method = data.method;
    const endpoint = Handlebars.compile(data.endpoint)(context);

    const compiledHeaders = Handlebars.compile(data.headers || "")(context);

    // Parse headers defensively using the shared util. Map any parsing errors
    // to a NonRetriableError so the orchestration knows it's a config/user issue.
    let parsedHeaders: Record<string, string>;
    try {
      parsedHeaders = tryParseHeaders(compiledHeaders);
    } catch (err) {
      // preserve original error message if present
      const msg =
        err instanceof Error && err.message ? err.message : "Invalid headers";
      throw new NonRetriableError(
        `HTTP Request node: Invalid headers. Expected JSON object or key:value pairs. (${msg})`
      );
    }

    const options: KyOptions = {
      method,
      throwHttpErrors: false,
    };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      const resolvedBody = Handlebars.compile(data.body || "{}")(context);
      JSON.parse(resolvedBody);
      options.body = resolvedBody;

      const hasContentType = Object.keys(parsedHeaders).some(
        (h) => h.toLowerCase() === "content-type"
      );

      if (!hasContentType) {
        parsedHeaders["Content-Type"] = "application/json";
      }
    }

    console.log({ parsedHeaders });

    options.headers = parsedHeaders;

    const response = await ky(endpoint, options);
    // const contentType = response.headers.get("content-type") ?? "";
    let responseData;

    try {
      responseData = await response.json();
    } catch (jsonErr) {
      try {
        responseData = await response.text();
      } catch (textErr) {
        console.error("Failed to parse response as JSON or text", textErr);
        responseData = {};
      }
    }

    const responsePayload = {
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    };

    return {
      ...context,
      [data.variableName]: responsePayload,
    };
  });

  return result;
};

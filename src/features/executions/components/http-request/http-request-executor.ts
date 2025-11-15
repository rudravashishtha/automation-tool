import ky, { type Options as KyOptions } from "ky";
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { tryParseHeaders } from "@/lib/utils";

type HttpRequestData = {
  headers?: string | Record<string, unknown> | null;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
  variableName?: string;
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

  const result = await step.run("http-request", async () => {
    const method = data.method || "GET";
    const endpoint = data.endpoint!;

    // Parse headers defensively using the shared util. Map any parsing errors
    // to a NonRetriableError so the orchestration knows it's a config/user issue.
    let parsedHeaders: Record<string, string>;
    try {
      parsedHeaders = tryParseHeaders(data.headers);
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
      options.body = data.body;

      const hasContentType = Object.keys(parsedHeaders).some(
        (h) => h.toLowerCase() === "content-type"
      );

      if (!hasContentType) {
        parsedHeaders["Content-Type"] = "application/json";
      }
    }

    options.headers = parsedHeaders;

    if (options.body !== undefined)
      console.log(`[HttpRequestExecutor] body:`, options.body);

    const response = await ky(endpoint, options);
    const contentType = response.headers.get("content-type") ?? "";
    const responseData = contentType.includes("application/json")
      ? await response.json().catch(() => response.text())
      : await response.text();

    const responsePayload = {
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    };

    if (data.variableName) {
      return {
        ...context,
        [data.variableName]: responsePayload,
      };
    }

    // Fallback to direct httpResponse
    return {
      ...context,
      ...responsePayload,
    };
  });

  return result;
};

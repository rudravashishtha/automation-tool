import Handlebars from "handlebars";
import ky, { type Options as KyOptions } from "ky";
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { tryParseHeaders } from "./utils";
import { httpRequestChannel } from "@/inngest/channels/http-request";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

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
  publish,
}) => {
  try {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "loading",
      })
    );
  } catch (error) {
    console.warn("Failed to publish loading status:", error);
  }

  try {
    const result = await step.run("http-request", async () => {
      if (!data.endpoint) {
        try {
          await publish(
            httpRequestChannel().status({
              nodeId,
              status: "error",
            })
          );
        } catch (error) {
          console.warn("Failed to publish error status:", error);
        }
        throw new NonRetriableError(
          "HTTP Request node: No endpoint configured"
        );
      }

      if (!data.variableName) {
        await publish(
          httpRequestChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError(
          "HTTP Request node: No variable name configured"
        );
      }

      if (!data.method) {
        await publish(
          httpRequestChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("HTTP Request node: Method not configured");
      }

      const { method } = data;
      console.log({ data });
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

      options.headers = parsedHeaders;

      const response = await ky(endpoint, options);

      let responseData: any = {};
      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        responseData = null;
      } else {
        const raw = await response.text();

        if (!raw) {
          responseData = null;
        } else {
          try {
            responseData = JSON.parse(raw);
          } catch (err) {
            responseData = raw;
          }
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

    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "success",
      })
    );

    return result;
  } catch (error) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};

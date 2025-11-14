import ky, { type Options as KyOptions } from "ky";
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";

type HttpRequestData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

export const HttpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  // TODO: Publish loadind state for http request

  if (!data.endpoint) {
    // TODO: Publish "error"
    throw new NonRetriableError("HTTP Request node: No endpoint configured");
  }

  const result = await step.run("http-request", async () => {
    const method = data.method || "GET";
    const endpoint = data.endpoint!;

    const options: KyOptions = {
      method,
    };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      options.body = data.body;
    }

    const response = await ky(endpoint, options);
    const contentType = response.headers.get("content-type") ?? "";
    const responseData = contentType?.includes("application/json")
      ? await response.json().catch(() => response.text())
      : await response.text();

    return {
      ...context,
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    };
  });

  // TODO: Publish "success/failure" state for http request

  return result;
};

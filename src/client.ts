import type { ZodType } from "zod";
import { useSFContext, type SFContextValue } from "./provider";

export const SUPPORTED_HTTP_VERBS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
] as const;
export type HttpVerb = (typeof SUPPORTED_HTTP_VERBS)[number];

export class SFApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message: string,
  ) {
    super(message);
    this.name = "SFApiError";
  }
}

export type SFCallOptions<T = unknown> = {
  data?: unknown;
  /** If true, treat `endpoint` as an absolute path under instanceUrl (e.g. nextRecordsUrl).
   *  Otherwise, prefixed with `/services/data/{apiVersion}`. */
  absolutePath?: boolean;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  /** Optional zod schema — when provided, the response is parsed and T is inferred. */
  schema?: ZodType<T>;
};

function trimSlashes(s: string): string {
  return s.replace(/^\/+|\/+$/g, "");
}

function removeDoubleSlashes(uri: string): string {
  // Preserve protocol `://`
  return uri.replace(/([^:])\/\/+/g, "$1/");
}

export function buildUrl(
  ctx: Pick<SFContextValue, "instanceUrl" | "apiVersion">,
  endpoint: string,
  absolutePath = false,
): string {
  const base = ctx.instanceUrl.replace(/\/+$/, "");
  if (absolutePath) {
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return removeDoubleSlashes(`${base}${path}`);
  }
  const path = `/services/data/${trimSlashes(ctx.apiVersion)}/${trimSlashes(endpoint)}`;
  return removeDoubleSlashes(`${base}${path}`);
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return {} as T;
  const text = await response.text();
  let parsed: unknown = undefined;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }
  if (!response.ok) {
    const msg =
      (Array.isArray(parsed) && (parsed[0] as { message?: string })?.message) ||
      (typeof parsed === "object" && parsed && "message" in (parsed as Record<string, unknown>)
        ? String((parsed as Record<string, unknown>).message)
        : `Request failed with status ${response.status}`);
    throw new SFApiError(response.status, parsed, msg);
  }
  return parsed as T;
}

export type SFClient = {
  request: <T = unknown>(
    method: HttpVerb,
    endpoint: string,
    options?: SFCallOptions,
  ) => Promise<T>;
  get: <T = unknown>(endpoint: string, options?: SFCallOptions) => Promise<T>;
  post: <T = unknown>(endpoint: string, options?: SFCallOptions) => Promise<T>;
  patch: <T = unknown>(endpoint: string, options?: SFCallOptions) => Promise<T>;
  put: <T = unknown>(endpoint: string, options?: SFCallOptions) => Promise<T>;
  delete: <T = unknown>(endpoint: string, options?: SFCallOptions) => Promise<T>;
};

export function createSFClient(ctx: SFContextValue): SFClient {
  async function request<T>(
    method: HttpVerb,
    endpoint: string,
    options: SFCallOptions = {},
  ): Promise<T> {
    const token = await Promise.resolve(ctx.getToken());
    if (!token) {
      throw new SFApiError(401, null, "No Salesforce session token provided");
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    };

    const init: RequestInit = { method, headers, signal: options.signal };

    if (method === "POST" || method === "PUT" || method === "PATCH") {
      headers["Content-Type"] = "application/json";
      if (options.data !== undefined) {
        init.body = JSON.stringify(options.data);
      }
    }

    const url = buildUrl(ctx, endpoint, options.absolutePath);
    const response = await fetch(url, init);
    const body = await handleResponse<T>(response);
    if (options.schema) {
      const parsed = options.schema.safeParse(body);
      if (!parsed.success) {
        throw new SFApiError(
          response.status,
          body,
          `Salesforce response failed schema validation: ${parsed.error.message}`,
        );
      }
      return parsed.data as T;
    }
    return body;
  }

  return {
    request,
    get: (endpoint, options) => request("GET", endpoint, options),
    post: (endpoint, options) => request("POST", endpoint, options),
    patch: (endpoint, options) => request("PATCH", endpoint, options),
    put: (endpoint, options) => request("PUT", endpoint, options),
    delete: (endpoint, options) => request("DELETE", endpoint, options),
  };
}

export function useSFClient(): SFClient {
  const ctx = useSFContext();
  return createSFClient(ctx);
}

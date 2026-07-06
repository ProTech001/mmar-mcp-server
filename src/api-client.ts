/**
 * MM-AR API Client
 * 
 * A lightweight HTTP client that wraps the MM-AR REST API.
 * Manages JWT authentication tokens and provides typed methods
 * for all API categories (auth, metamodel, instance).
 * 
 * Phase 3 enhancements:
 *  - Structured error responses with actionable guidance
 *  - Retry logic for transient failures (503, ECONNREFUSED)
 *  - Pre-flight UUID validation helper
 */

import { config } from "./config.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validate that a string is a well-formed UUID v4.
 * Use this before making API calls to catch malformed UUIDs early.
 */
export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Map HTTP status codes to actionable LLM guidance.
 */
function getErrorGuidance(status: number, method: string, path: string): string {
  switch (status) {
    case 400:
      return "The request payload is malformed. Check JSON structure, required fields, and UUID formats. Read the metamodel-schema resource for the correct format.";
    case 401:
      return "Not authenticated. Call mmar_login first, or your session may have expired — call mmar_login again.";
    case 403:
      return "Permission denied. The current user does not have access to this resource.";
    case 404:
      return "The resource was not found. Verify the UUID exists by listing available items first (e.g., mmar_list_scene_types, mmar_get_class_instances).";
    case 409:
      return "Conflict — a resource with this UUID already exists. Generate a new UUID and try again.";
    case 500:
      if (path.includes("sceneTypes") && method === "DELETE") {
        return "Known MM-AR API issue: DELETE SceneType may fail due to a database function bug. Try deleting via the Metamodeling Client UI at http://localhost:8070, or use docker exec to delete directly from PostgreSQL.";
      }
      return "Internal server error in MM-AR. This may be a known API limitation. Try a different approach or check the MM-AR server logs.";
    case 503:
      return "MM-AR server is temporarily unavailable. Wait a moment and retry.";
    default:
      return "";
  }
}

class MmarApiClient {
  private token: string | null = null;
  private baseUrl: string;
  private maxRetries: number = 2;
  private retryDelayMs: number = 1000;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
  }

  // ─────────────────────────────────────────────
  // Session Management
  // ─────────────────────────────────────────────

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
  }

  // ─────────────────────────────────────────────
  // Authentication
  // ─────────────────────────────────────────────

  async login(username: string, password: string): Promise<string> {
    const response = await this.request("POST", "/login/signin", {
      username,
      password,
    });

    const token = typeof response === "string" 
      ? response.replace(/^"|"$/g, "") 
      : String(response);

    this.token = token;
    return token;
  }

  // ─────────────────────────────────────────────
  // Generic HTTP Methods
  // ─────────────────────────────────────────────

  async get<T = unknown>(path: string): Promise<T> {
    return this.request("GET", path) as Promise<T>;
  }

  async post<T = unknown>(path: string, body: unknown): Promise<T> {
    return this.request("POST", path, body) as Promise<T>;
  }

  async patch<T = unknown>(path: string, body: unknown): Promise<T> {
    return this.request("PATCH", path, body) as Promise<T>;
  }

  async delete<T = unknown>(path: string): Promise<T> {
    return this.request("DELETE", path) as Promise<T>;
  }

  // ─────────────────────────────────────────────
  // Internal HTTP Helper with Retry Logic
  // ─────────────────────────────────────────────

  private async request(
    method: string,
    path: string,
    body?: unknown
  ): Promise<unknown> {
    const url = `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    if (this.token && !path.startsWith("/login/sign") && !path.startsWith("/login/signup")) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          const guidance = getErrorGuidance(response.status, method, path);
          const guidanceStr = guidance ? `\n💡 Suggestion: ${guidance}` : "";

          throw new Error(
            `MM-AR API Error [${method} ${path}]: ${response.status} ${response.statusText} — ${errorText}${guidanceStr}`
          );
        }

        const contentType = response.headers.get("content-type");
        if (response.status === 204 || !contentType) {
          return null;
        }

        if (contentType.includes("application/json")) {
          return response.json();
        }

        return response.text();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        const isRetryable = this.isRetryableError(lastError);
        if (isRetryable && attempt < this.maxRetries) {
          await this.delay(this.retryDelayMs * (attempt + 1));
          continue;
        }

        throw lastError;
      }
    }

    throw lastError ?? new Error("Request failed after retries");
  }

  private isRetryableError(error: Error): boolean {
    const msg = error.message;
    return (
      msg.includes("503") ||
      msg.includes("ECONNREFUSED") ||
      msg.includes("ECONNRESET") ||
      msg.includes("ETIMEDOUT") ||
      msg.includes("fetch failed")
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const apiClient = new MmarApiClient();

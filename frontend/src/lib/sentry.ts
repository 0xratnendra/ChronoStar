export interface SentryBreadcrumb {
  category: "wallet" | "api" | "contract" | "ui";
  message: string;
  level?: "info" | "warning" | "error";
  data?: Record<string, unknown>;
}

const USER_REJECTION_PATTERNS = [
  "user declined",
  "transaction rejected",
  "user rejected",
  "declined by user",
  "wallet closed",
  "request rejected",
];

export function isUserRejectionError(error: unknown): boolean {
  if (!error) return false;
  const msg = typeof error === "string" ? error : error instanceof Error ? error.message : JSON.stringify(error);
  const lower = msg.toLowerCase();
  return USER_REJECTION_PATTERNS.some((pattern) => lower.includes(pattern));
}

export function initSentry(): boolean {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    // Absent in local development / unconfigured env
    return false;
  }

  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || "development";
  const release = process.env.NEXT_PUBLIC_RELEASE || "chronostar-frontend@1.0.0";

  if (typeof window !== "undefined") {
    window.__SENTRY_CONFIG__ = {
      dsn,
      environment,
      release,
      enabled: true,
    };
  }

  return true;
}

const breadcrumbsBuffer: SentryBreadcrumb[] = [];

export function addBreadcrumb(crumb: SentryBreadcrumb): void {
  if (breadcrumbsBuffer.length >= 50) {
    breadcrumbsBuffer.shift();
  }
  breadcrumbsBuffer.push({
    ...crumb,
    level: crumb.level || "info",
  });

  if (process.env.NODE_ENV !== "production") {
    console.debug(`[Sentry Breadcrumb][${crumb.category}]`, crumb.message, crumb.data || "");
  }
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (isUserRejectionError(error)) {
    // Filter out user-rejected signatures so signal stays clean
    addBreadcrumb({
      category: "wallet",
      message: "User declined transaction signature (filtered from telemetry)",
      level: "info",
    });
    return;
  }

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    console.error("[Sentry Disabled]", error, context || "");
    return;
  }

  console.error("[Sentry Exception]", error, {
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || "development",
    release: process.env.NEXT_PUBLIC_RELEASE || "1.0.0",
    context,
    recentBreadcrumbs: breadcrumbsBuffer.slice(-10),
  });
}

// Global declaration
declare global {
  interface Window {
    __SENTRY_CONFIG__?: {
      dsn: string;
      environment: string;
      release: string;
      enabled: boolean;
    };
  }
}

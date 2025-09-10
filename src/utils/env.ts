// Environment variable types
export interface RuntimeEnvironment {
  [key: string]: string;
}

// Cache configuration
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxAge: number; // Maximum age in milliseconds
}

// Cache entry structure
interface CacheEntry {
  data: RuntimeEnvironment;
  timestamp: number;
  maxAge: number;
}

// In-memory cache for environment variables
let envCache: CacheEntry | null = null;

// Default cache configuration
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes in development
  maxAge: 30 * 60 * 1000, // 30 minutes in production
};

// Get cache TTL based on environment
function getCacheTTL(): number {
  const isDev = process.env.NODE_ENV === "development";
  return isDev ? DEFAULT_CACHE_CONFIG.ttl : DEFAULT_CACHE_CONFIG.maxAge;
}

// Check if cache is valid
function isCacheValid(entry: CacheEntry | null): boolean {
  if (!entry) return false;
  const now = Date.now();
  return now - entry.timestamp < entry.maxAge;
}

// Get environment-specific file path
function getEnvFilePath(): string {
  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    // Client-side detection: use hostname and port to determine dev environment
    const isDev =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.port === "3000";
    return isDev ? "/env.json" : "/_next/static/env.json";
  } else {
    // Server-side: use NODE_ENV
    const isDev = process.env.NODE_ENV === "development";
    return isDev ? "/env.json" : "/_next/static/env.json";
  }
}

// Enhanced runtime environment fetcher with caching, error handling, and retries
export const runtimeEnv = async (
  options: {
    skipCache?: boolean;
    timeout?: number;
    retries?: number;
  } = {}
): Promise<RuntimeEnvironment> => {
  const { skipCache = false, timeout = 10000, retries = 3 } = options;

  // Return cached data if valid and not skipping cache
  if (!skipCache && isCacheValid(envCache)) {
    return envCache!.data;
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError: Error | null = null;

  // Get the appropriate file path based on environment
  const envFilePath = getEnvFilePath();

  // Retry logic
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(envFilePath, {
        cache: "no-store",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });

      // Clear timeout on successful response
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Response is not valid JSON");
      }

      const env = await res.json();

      // Validate response structure
      if (!env || typeof env !== "object") {
        throw new Error("Invalid environment data structure");
      }

      // Update cache
      envCache = {
        data: env,
        timestamp: Date.now(),
        maxAge: getCacheTTL(),
      };

      return env;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on abort (timeout)
      if (error instanceof Error && error.name === "AbortError") {
        clearTimeout(timeoutId);
        break;
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  clearTimeout(timeoutId);

  // If all retries failed, try to return cached data even if stale
  if (envCache && envCache.data) {
    console.warn(
      "Using stale environment cache due to fetch failure:",
      lastError?.message
    );
    return envCache.data;
  }

  // Fallback to process.env for critical variables
  const fallbackEnv: RuntimeEnvironment = {};
  const criticalVars = ["NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_APP_URL"];

  criticalVars.forEach((key) => {
    const value = process.env[key];
    if (value) {
      fallbackEnv[key] = value;
    }
  });

  if (Object.keys(fallbackEnv).length > 0) {
    console.warn(
      "Using fallback environment variables:",
      Object.keys(fallbackEnv)
    );
    return fallbackEnv;
  }

  // If everything fails, throw the last error
  throw new Error(
    `Failed to load environment variables after ${retries} attempts: ${lastError?.message}`
  );
};

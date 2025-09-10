// Utility functions for updating environment variables at runtime

export interface EnvUpdateResponse {
  success: boolean;
  message: string;
  env?: Record<string, string>;
  error?: string;
}

// Update specific environment variables (merge with existing)
export const updateEnvVars = async (
  envVars: Record<string, string>
): Promise<EnvUpdateResponse> => {
  try {
    const response = await fetch("/api/env", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(envVars),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update environment variables");
    }

    return data;
  } catch (error) {
    console.error("Error updating environment variables:", error);
    return {
      success: false,
      message: "Failed to update environment variables",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Replace all environment variables
export const replaceEnvVars = async (
  envVars: Record<string, string>
): Promise<EnvUpdateResponse> => {
  try {
    const response = await fetch("/api/env", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(envVars),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to replace environment variables");
    }

    return data;
  } catch (error) {
    console.error("Error replacing environment variables:", error);
    return {
      success: false,
      message: "Failed to replace environment variables",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Delete specific environment variables
export const deleteEnvVars = async (
  keys: string[]
): Promise<EnvUpdateResponse> => {
  try {
    const response = await fetch(`/api/env?keys=${keys.join(",")}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete environment variables");
    }

    return data;
  } catch (error) {
    console.error("Error deleting environment variables:", error);
    return {
      success: false,
      message: "Failed to delete environment variables",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Get current environment variables from the API endpoint
export const getCurrentEnvVars = async (): Promise<Record<
  string,
  string
> | null> => {
  try {
    const response = await fetch("/api/env", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch environment variables");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching environment variables:", error);
    return null;
  }
};

// Get environment-specific file path for client-side usage
function getClientEnvPath(): string {
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

// Get current environment variables directly from the static file (same as runtimeEnv)
export const getEnvVarsFromStatic = async (): Promise<Record<
  string,
  string
> | null> => {
  try {
    const envPath = getClientEnvPath();
    const response = await fetch(envPath, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch environment variables from static file");
    }

    return await response.json();
  } catch (error) {
    console.error(
      "Error fetching environment variables from static file:",
      error
    );
    return null;
  }
};

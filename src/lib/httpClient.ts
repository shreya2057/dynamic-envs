import axios from "axios";
import { env } from "next-runtime-env";

// Helper function to get base URL safely for both server and client
function getBaseURL(): string {
  const apiUrl = env("NEXT_PUBLIC_API_URL");

  if (apiUrl) {
    return apiUrl;
  }

  // Only access window on client side
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Server-side fallback
  return process.env.NEXT_PUBLIC_API_URL || "";
}

export const httpClient = axios.create({
  baseURL: getBaseURL(),
});

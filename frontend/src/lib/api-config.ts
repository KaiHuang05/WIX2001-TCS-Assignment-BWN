/**
 * API Configuration
 */

// Get the API base URL from environment variable or use default
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Test mode flag - when true, uses test endpoint instead of real API (no credits used)
export const IS_TEST_MODE = import.meta.env.VITE_TEST_MODE === "true";

// API Endpoints
export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/health`,
  voiceClone: `${API_BASE_URL}/api/voice-clone`,
  styleGuide: `${API_BASE_URL}/api/style-guide`,
  styleGuideBase64: `${API_BASE_URL}/api/style-guide-base64`,
  testStyleGuide: `${API_BASE_URL}/api/test-style-guide`, // Test endpoint - no credits used!
};

/**
 * Test API connection
 */
export async function testApiConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: "GET",
    });
    return response.ok;
  } catch (error) {
    console.error("API connection test failed:", error);
    return false;
  }
}

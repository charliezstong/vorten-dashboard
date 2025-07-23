import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  try {
    // For now, return empty list
    // In a real implementation, you would get this from Better Auth
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Passkey list error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Failed to list passkeys" 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 
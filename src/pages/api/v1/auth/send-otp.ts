import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    const response = await fetch(`${import.meta.env.TRADIT_API_URL}/api/v1/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.TRADIT_API_KEY || '',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: { 
        code: "PROXY_ERROR", 
        message: "Error forwarding request to Tradit API" 
      } 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}; 
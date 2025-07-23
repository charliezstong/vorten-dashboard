import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check if environment variables are set
    if (!import.meta.env.TRADIT_API_URL) {
      console.error('TRADIT_API_URL not configured');
      return new Response(JSON.stringify({ 
        success: false, 
        error: { 
          code: "CONFIG_ERROR", 
          message: "Tradit API URL not configured" 
        } 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { phoneNumber } = body;
    
    if (!phoneNumber) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: { 
          code: "VALIDATION_ERROR", 
          message: "Phone number is required" 
        } 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Checking phone number:', phoneNumber);
    console.log('Tradit API URL:', import.meta.env.TRADIT_API_URL);
    
    const response = await fetch(`${import.meta.env.TRADIT_API_URL}/api/v1/auth/check-phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber })
    });

    const data = await response.json();
    console.log('Tradit API response:', data);

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in check-phone endpoint:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: { 
        code: "PROXY_ERROR", 
        message: "Error forwarding request to Tradit API",
        details: error instanceof Error ? error.message : 'Unknown error'
      } 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}; 
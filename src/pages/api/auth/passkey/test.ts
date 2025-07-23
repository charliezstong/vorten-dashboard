import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ 
    success: true, 
    message: "Passkey test endpoint working" 
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const body = await request.json();
      console.log('Request body:', body);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Received JSON data",
        data: body
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No JSON data received",
        contentType: contentType
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Test endpoint error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Test endpoint failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 
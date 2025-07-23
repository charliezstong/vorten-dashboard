import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    // Get session cookie from request headers
    const cookieHeader = request.headers.get('cookie');
    const sessionCookie = cookieHeader?.split(';')
      .find(c => c.trim().startsWith('tradit-session='))
      ?.split('=')[1];
    
    if (sessionCookie) {
      try {
        // Decrypt session info
        const sessionInfo = JSON.parse(atob(sessionCookie));
        
        if (sessionInfo.traditToken) {
          // Logout from Tradit API
          await fetch(`${import.meta.env.TRADIT_API_URL}/api/v1/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${sessionInfo.traditToken}`,
              'Content-Type': 'application/json',
            }
          });
        }
      } catch (error) {
        // Ignore errors during logout
        console.error('Error during logout:', error);
      }
    }
    
    // Clear the session cookie
    cookies.delete('tradit-session');
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Logged out successfully" 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Error during logout" 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 
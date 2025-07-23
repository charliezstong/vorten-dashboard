import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('Passkey authentication endpoint called');
    
    // Generate authentication options
    console.log('Passkey authentication: Generating options...');
    
    // Generate simple random challenge (not cryptographically secure for demo)
    const challenge = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
    
    // Create options for WebAuthn
    const options = {
      challenge: challenge,
      rpId: "localhost",
      timeout: 60000,
      userVerification: "preferred"
    };
    
    console.log('Generated authentication options:', options);
    
    return new Response(JSON.stringify(options), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Passkey authentication error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Passkey authentication failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 
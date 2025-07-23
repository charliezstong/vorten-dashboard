import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('Passkey registration endpoint called');
    
    // Generate registration options
    console.log('Passkey registration: Generating options...');
    
    // Generate simple random values (not cryptographically secure for demo)
    const challenge = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
    const userId = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
    
    // Create options for WebAuthn
    const options = {
      challenge: challenge,
      rp: {
        name: "Tradit Dashboard",
        id: "localhost"
      },
      user: {
        id: userId,
        name: "user@example.com",
        displayName: "User"
      },
      pubKeyCredParams: [
        {
          type: "public-key",
          alg: -7 // ES256
        }
      ],
      timeout: 60000,
      attestation: "direct"
    };
    
    console.log('Generated options:', options);
    
    return new Response(JSON.stringify(options), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Passkey registration error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Passkey registration failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 
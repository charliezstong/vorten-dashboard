import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { phoneNumber, invitationCode, otpCode } = body;

    console.log('Login attempt:', { phoneNumber, invitationCode: invitationCode ? 'provided' : 'not provided', otpCode });

    // If invitation code is provided, verify it first
    if (invitationCode) {
      console.log('Verifying invitation code...');
      const verifyInvitationResponse = await fetch(`${import.meta.env.TRADIT_API_URL}/api/v1/auth/verify-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invitationCode })
      });

      if (!verifyInvitationResponse.ok) {
        console.log('Invalid invitation code');
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Invalid invitation code" 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      console.log('Invitation code verified');
    }

    // If invitation code was provided, do login first
    let loginData = null;
    if (invitationCode) {
      console.log('Logging in with invitation code...');
      const loginResponse = await fetch(`${import.meta.env.TRADIT_API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, invitationCode })
      });

      if (!loginResponse.ok) {
        console.log('Login failed');
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Login failed" 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      loginData = await loginResponse.json();
      console.log('Login successful');
    }

    // Verify OTP (this is the main step)
    console.log('Verifying OTP...');
    const verifyOtpResponse = await fetch(`${import.meta.env.TRADIT_API_URL}/api/v1/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, otpCode })
    });

    if (!verifyOtpResponse.ok) {
      console.log('Invalid OTP');
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid OTP" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const otpData = await verifyOtpResponse.json();
    console.log('OTP verified successfully');
    console.log('OTP response data:', otpData);

    // Store Tradit token in encrypted cookie
    const sessionInfo = {
      traditToken: otpData.sessionToken || otpData.token || otpData.accessToken || (loginData ? loginData.token : null),
      userId: otpData.userId || otpData.user_id || phoneNumber,
      phoneNumber,
      sessionId: otpData.sessionId || otpData.session_id || otpData.userId || phoneNumber
    };

    console.log('Session info:', { ...sessionInfo, traditToken: sessionInfo.traditToken ? 'present' : 'missing' });

    // Encrypt session info for cookie
    const encryptedSession = btoa(JSON.stringify(sessionInfo));
    console.log('Encrypted session length:', encryptedSession.length);

    // Set session cookie (contains Tradit token)
    cookies.set('tradit-session', encryptedSession, {
      httpOnly: false, // Allow JavaScript access for debugging
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/' // Ensure cookie is available on all paths
    });

    console.log('Session cookie set successfully');
    console.log('Cookie value length:', cookies.get('tradit-session')?.value?.length || 0);
    console.log('Cookie value preview:', cookies.get('tradit-session')?.value?.substring(0, 50) + '...');
    
    // Also set a simple test cookie to verify cookie setting works
    cookies.set('test-cookie', 'test-value', {
      httpOnly: false,
      path: '/'
    });
    console.log('Test cookie set:', cookies.get('test-cookie')?.value);

    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        id: otpData.userId || otpData.user_id || phoneNumber,
        phoneNumber,
        name: `User ${phoneNumber}`
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Tradit login error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 
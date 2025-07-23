import { betterAuth } from "better-auth"
import { passkey } from "better-auth/plugins/passkey"

export const auth = betterAuth({
  secret: import.meta.env.AUTH_SECRET,
  trustHost: true,
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  providers: [
    {
      type: "credentials",
      id: "tradit",
      name: "Tradit",
      credentials: {
        phoneNumber: { type: "text" },
        invitationCode: { type: "text" },
        otpCode: { type: "text" }
      },
      async authorize(credentials: any) {
        try {
          // Step 1: Verify invitation code
          if (credentials.invitationCode) {
            const verifyInvitationResponse = await fetch(`${import.meta.env.TRADIT_API_URL}/api/v1/auth/verify-invitation`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ invitationCode: credentials.invitationCode })
            });

            if (!verifyInvitationResponse.ok) {
              return null;
            }
          }

          // Step 2: Login with phone and invitation code
          const loginResponse = await fetch(`${import.meta.env.TRADIT_API_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              phoneNumber: credentials.phoneNumber, 
              invitationCode: credentials.invitationCode || '' 
            })
          });

          if (!loginResponse.ok) {
            return null;
          }

          const loginData = await loginResponse.json();

          // Step 3: Verify OTP
          const verifyOtpResponse = await fetch(`${import.meta.env.TRADIT_API_URL}/api/v1/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              phoneNumber: credentials.phoneNumber, 
              otpCode: credentials.otpCode 
            })
          });

          if (!verifyOtpResponse.ok) {
            return null;
          }

          const otpData = await verifyOtpResponse.json();

          // Return user data for Better Auth
          return {
            id: otpData.userId || credentials.phoneNumber,
            phoneNumber: credentials.phoneNumber,
            traditToken: otpData.token || loginData.token,
            name: `User ${credentials.phoneNumber}`
          };
        } catch (error) {
          console.error('Tradit auth error:', error);
          return null;
        }
      }
    }
  ],
  plugins: [
    passkey({
      rpID: import.meta.env.AUTH_RP_ID || "localhost",
      rpName: "Tradit Dashboard",
      origin: import.meta.env.AUTH_ORIGIN || "http://localhost:4321",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "preferred"
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.traditToken = user.traditToken;
        token.phoneNumber = user.phoneNumber;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.sub;
        session.user.phoneNumber = token.phoneNumber;
        session.traditToken = token.traditToken;
      }
      return session;
    }
  }
}); 
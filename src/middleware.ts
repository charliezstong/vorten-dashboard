import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  console.log('Middleware: Checking for session cookie...');
  
  // Check for tradit session cookie
  const sessionCookie = context.cookies.get('tradit-session');
  
  if (sessionCookie?.value) {
    console.log('Middleware: Found session cookie, length:', sessionCookie.value.length);
    
    try {
      // Decrypt session info from cookie
      const sessionInfo = JSON.parse(atob(sessionCookie.value));
      console.log('Middleware: Decrypted session info:', { 
        userId: sessionInfo.userId, 
        phoneNumber: sessionInfo.phoneNumber,
        hasToken: !!sessionInfo.traditToken 
      });
      
      if (sessionInfo.traditToken) {
        // For now, just use the session data from cookie
        // In production, you might want to verify with your API
        context.locals.user = {
          id: sessionInfo.userId,
          phoneNumber: sessionInfo.phoneNumber,
          name: `User ${sessionInfo.phoneNumber}`
        };
        context.locals.session = {
          user: context.locals.user,
          traditToken: sessionInfo.traditToken,
          sessionId: sessionInfo.sessionId
        };
        console.log('Middleware: Session set successfully');
      } else {
        console.log('Middleware: No traditToken found, clearing session');
        // Invalid session data, clear it
        context.cookies.delete('tradit-session');
        context.locals.user = null;
        context.locals.session = null;
      }
    } catch (error) {
      console.log('Middleware: Error parsing session cookie:', error);
      // Invalid session data, clear it
      context.cookies.delete('tradit-session');
      context.locals.user = null;
      context.locals.session = null;
    }
  } else {
    console.log('Middleware: No session cookie found');
    context.locals.user = null;
    context.locals.session = null;
  }

  return next();
}); 
import { encryptSession, decryptSession } from './crypto';

interface SessionData {
  id: string;
  userId: string;
  phoneNumber: string;
  traditToken: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

// In-memory session store (en producción usar DB)
const sessionStore = new Map<string, SessionData>();

export class SessionManager {
  private static instance: SessionManager;
  
  private constructor() {}
  
  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async createSession(userData: {
    userId: string;
    phoneNumber: string;
    traditToken: string;
  }): Promise<string> {
    const sessionId = this.generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const sessionData: SessionData = {
      id: sessionId,
      userId: userData.userId,
      phoneNumber: userData.phoneNumber,
      traditToken: userData.traditToken,
      createdAt: now,
      expiresAt,
      isActive: true
    };

    // Store in memory (en producción usar DB)
    sessionStore.set(sessionId, sessionData);

    return sessionId;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const session = sessionStore.get(sessionId);
    
    if (!session) {
      return null;
    }

    // Check if session is expired
    if (new Date() > session.expiresAt || !session.isActive) {
      this.invalidateSession(sessionId);
      return null;
    }

    return session;
  }

  async invalidateSession(sessionId: string): Promise<void> {
    sessionStore.delete(sessionId);
  }

  async invalidateUserSessions(userId: string): Promise<void> {
    for (const [sessionId, session] of sessionStore.entries()) {
      if (session.userId === userId) {
        sessionStore.delete(sessionId);
      }
    }
  }

  async refreshSession(sessionId: string): Promise<string | null> {
    const session = await this.getSession(sessionId);
    
    if (!session) {
      return null;
    }

    // Create new session
    const newSessionId = this.generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const newSessionData: SessionData = {
      ...session,
      id: newSessionId,
      createdAt: now,
      expiresAt
    };

    sessionStore.set(newSessionId, newSessionData);
    sessionStore.delete(sessionId);

    return newSessionId;
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Utility methods for cookie management
  encryptSessionForCookie(sessionId: string): string {
    return encryptSession({ sessionId });
  }

  decryptSessionFromCookie(encryptedData: string): string | null {
    try {
      const data = decryptSession(encryptedData);
      return data.sessionId;
    } catch {
      return null;
    }
  }
} 
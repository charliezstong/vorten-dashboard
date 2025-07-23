/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: {
      id: string;
      phoneNumber: string;
      name: string;
    } | null;
    session: {
      user: {
        id: string;
        phoneNumber: string;
        name: string;
      };
      traditToken: string;
      sessionId: string;
    } | null;
  }
} 
// this sets up the encrypted cookie used to remember a login
import { cookies } from "next/headers";

import { getIronSession } from "iron-session";

export type SessionData = {
  userId?: string;
  username?: string;
  isLoggedIn: boolean;
};

function getSessionPassword() {
  const password = process.env.SESSION_SECRET;

  // iron-session needs a long secret to encrypt the cookie safely
  if (!password || password.length < 32) {
    throw new Error(
      "SESSION_SECRET must be at least 32 characters long."
    );
  }

  return password;
}

export async function getSession() {
  // next.js gives the server access to cookies for this request
  const cookieStore = await cookies();

  // the cookie lasts for a week and cannot be read by browser javascript
  return getIronSession<SessionData>(cookieStore, {
    password: getSessionPassword(),
    cookieName: "bet-transparency-session",
    ttl: 60 * 60 * 24 * 7,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  });
}

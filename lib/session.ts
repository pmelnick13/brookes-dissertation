import { cookies } from "next/headers";

import { getIronSession } from "iron-session";

export type SessionData = {
  userId?: string;
  username?: string;
  isLoggedIn: boolean;
};

function getSessionPassword() {
  const password = process.env.SESSION_SECRET;

  if (!password || password.length < 32) {
    throw new Error(
      "SESSION_SECRET must be at least 32 characters long."
    );
  }

  return password;
}

export async function getSession() {
  const cookieStore = await cookies();

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

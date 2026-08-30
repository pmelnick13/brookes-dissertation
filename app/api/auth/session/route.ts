// this route gives the ui a safe summary of the current session
import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";

export async function GET() {
  try {
    // only send the bits of session data the navigation actually needs
    const session = await getSession();

    return NextResponse.json({
      isLoggedIn: session.isLoggedIn === true,
      username: session.username ?? null,
    });
  } catch {
    // if the cookie cannot be read, just treat the visitor as logged out
    return NextResponse.json({
      isLoggedIn: false,
      username: null,
    });
  }
}

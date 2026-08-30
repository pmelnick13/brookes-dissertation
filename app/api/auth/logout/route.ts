// this route clears the current login session
import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";

export async function POST() {
  // destroying the session also clears its cookie in the browser
  const session = await getSession();
  session.destroy();

  return NextResponse.json({ message: "Logged out successfully." });
}

import { compare } from "bcryptjs";
import { NextResponse } from "next/server";

import clientPromise from "@/lib/mongodb";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    if (!username || !password) {
      return NextResponse.json(
        { error: "Enter your username and password." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const user = await db.collection("users").findOne({
      normalizedUsername: username.toLowerCase(),
    });

    if (!user || !(await compare(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Username or password is incorrect." },
        { status: 401 }
      );
    }

    const session = await getSession();
    session.userId = user._id.toString();
    session.username = user.username;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ message: "Logged in successfully." });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Login failed." },
      { status: 500 }
    );
  }
}

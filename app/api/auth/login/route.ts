// this route checks the login details and starts a session
import { compare } from "bcryptjs";
import { NextResponse } from "next/server";

import clientPromise from "@/lib/mongodb";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    // tidy up the submitted values before checking the database
    const body = await request.json();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    if (!username || !password) {
      // skip the database request when either field is missing
      return NextResponse.json(
        { error: "Enter your username and password." },
        { status: 400 }
      );
    }

    // usernames are saved in lowercase form so the lookup is consistent
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const user = await db.collection("users").findOne({
      normalizedUsername: username.toLowerCase(),
    });

    if (!user || !(await compare(password, user.passwordHash))) {
      // use one message so the response does not reveal which detail was wrong
      return NextResponse.json(
        { error: "Username or password is incorrect." },
        { status: 401 }
      );
    }

    // save the safe account details in the encrypted session cookie
    const session = await getSession();
    session.userId = user._id.toString();
    session.username = user.username;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ message: "Logged in successfully." });
  } catch (error) {
    // keep the technical error on the server and return a simple message
    console.error(error);

    return NextResponse.json(
      { error: "Login failed." },
      { status: 500 }
    );
  }
}

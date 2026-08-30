import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import clientPromise from "@/lib/mongodb";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3 to 30 characters and use only letters, numbers, or underscores.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = db.collection("users");

    await users.createIndex(
      { normalizedUsername: 1 },
      { unique: true }
    );

    const normalizedUsername = username.toLowerCase();

    const existingUser = await users.findOne({ normalizedUsername });

    if (existingUser) {
      return NextResponse.json(
        { error: "That username is already in use." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const result = await users.insertOne({
      username,
      normalizedUsername,
      passwordHash,
      createdAt: new Date(),
    });

    const session = await getSession();
    session.userId = result.insertedId.toString();
    session.username = username;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json(
      { message: "Account created successfully." },
      { status: 201 }
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { error: "That username is already in use." },
        { status: 409 }
      );
    }

    console.error(error);

    return NextResponse.json(
      { error: "Account could not be created." },
      { status: 500 }
    );
  }
}

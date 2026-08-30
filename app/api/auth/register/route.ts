// this route creates an account and logs the new user in
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import clientPromise from "@/lib/mongodb";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    // clean up the submitted account details first
    const body = await request.json();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      // usernames stay simple so they are easy to store and search
      return NextResponse.json(
        {
          error:
            "Username must be 3 to 30 characters and use only letters, numbers, or underscores.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      // do this check again on the server instead of trusting the form
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // connect to the users collection after validation passes
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = db.collection("users");

    // the unique index stops the same username being saved twice
    await users.createIndex(
      { normalizedUsername: 1 },
      { unique: true }
    );

    // lowercase makes differently capitalised versions count as the same name
    const normalizedUsername = username.toLowerCase();

    const existingUser = await users.findOne({ normalizedUsername });

    if (existingUser) {
      // return a conflict instead of trying to insert a duplicate
      return NextResponse.json(
        { error: "That username is already in use." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    // only the hash is stored, never the original password
    const result = await users.insertOne({
      username,
      normalizedUsername,
      passwordHash,
      createdAt: new Date(),
    });

    // log the user in right after the account is created
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
    // mongodb can still catch a duplicate if two requests arrive together
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

    // keep unexpected details in the server log
    console.error(error);

    return NextResponse.json(
      { error: "Account could not be created." },
      { status: 500 }
    );
  }
}

// this route saves analyses and gets them back for the logged-in user
import { NextResponse } from "next/server";

import clientPromise from "@/lib/mongodb";
import { getSession } from "@/lib/session";


export async function POST(
  request: Request
) {
  try {
    // never trust a save request without checking the session first
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      // only signed-in users are allowed to save records
      return NextResponse.json(
        { error: "You must be logged in to save an analysis." },
        { status: 401 }
      );
    }

    // read the completed analysis sent by the calculator
    const body = await request.json();

    // use the database name from the private environment settings
    const client =
      await clientPromise;

    const db = client.db(
      process.env.MONGODB_DB
    );

    const analysis = {
      // the user id comes from the session rather than the browser
      userId: session.userId,

      stake: body.stake,
      legs: body.legs,

      winProbability:
        body.winProbability,

      lossProbability:
        body.lossProbability,

      risk:
        body.risk,

      legProbabilities:
        body.legProbabilities,

      cumulativeProbabilities:
        body.cumulativeProbabilities,

      combinedDecimalOdds:
        body.combinedDecimalOdds,

      potentialReturn:
        body.potentialReturn,

      potentialProfit:
        body.potentialProfit,

      createdAt:
        new Date(),
    };

    // add the finished record to the analyses collection
    const result =
      await db
        .collection("analyses")
        .insertOne(analysis);

    return NextResponse.json(
      {
        message:
          "Analysis saved successfully",

        id:
          result.insertedId,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    // log the real problem on the server and keep the response simple
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to save analysis",
      },
      {
        status: 500,
      }
    );
  }
}


export async function GET() {
  try {
    // history uses the same session check as saving
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      // do not expose anyone's saved history to a guest
      return NextResponse.json(
        { error: "You must be logged in to view bet history." },
        { status: 401 }
      );
    }

    const client =
      await clientPromise;

    const db = client.db(
      process.env.MONGODB_DB
    );

    const analyses =
      await db
        .collection("analyses")
        // only return records that belong to this account
        .find({
          userId: session.userId,
        })
        .sort({
          createdAt: -1,
        })
        .toArray();

    return NextResponse.json(
      analyses
    );
  } catch (error) {
    // database details stay in the server log
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to retrieve analyses",
      },
      {
        status: 500,
      }
    );
  }
}

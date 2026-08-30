import { NextResponse } from "next/server";

import clientPromise from "@/lib/mongodb";
import { getSession } from "@/lib/session";


export async function POST(
  request: Request
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: "You must be logged in to save an analysis." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const client =
      await clientPromise;

    const db = client.db(
      process.env.MONGODB_DB
    );

    const analysis = {
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
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
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

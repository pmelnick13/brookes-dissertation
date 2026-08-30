// this calculator shows the margin in a two-outcome market
"use client";

import { useState } from "react";

import {
  americanToProbability,
  calculateOverround,
  removeVig,
} from "@/lib/bettingMath";


export default function MarginCalculator() {
  // keep both odds inputs exactly as the user typed them
  const [outcomeA, setOutcomeA] = useState("");
  const [outcomeB, setOutcomeB] = useState("");
  const [error, setError] = useState("");

  // the calculated market values stay together in one result
  const [result, setResult] = useState<null | {
    probabilityA: number;
    probabilityB: number;
    fairProbabilityA: number;
    fairProbabilityB: number;
    overround: number;
  }>(null);


  function handleSubmit(
    event: React.SyntheticEvent<HTMLFormElement>
  ) {
    // both sides are needed before the market margin means anything
    event.preventDefault();

    setError("");

    const oddsA = Number(outcomeA);
    const oddsB = Number(outcomeB);

    if (
      outcomeA.trim() === "" ||
      outcomeB.trim() === ""
    ) {
      // both outcomes are needed to describe the whole market
      setError(
        "Please enter odds for both outcomes."
      );
      return;
    }

    if (
      !Number.isFinite(oddsA) ||
      !Number.isFinite(oddsB) ||
      oddsA === 0 ||
      oddsB === 0
    ) {
      // zero is not a valid american odds value
      setError(
        "Please enter valid American odds."
      );
      return;
    }

    const probabilityA =
      americanToProbability(oddsA);

    const probabilityB =
      americanToProbability(oddsB);

    const probabilities = [
      probabilityA,
      probabilityB,
    ];

    // anything over a combined 100% is the bookmaker's margin
    const overround =
      calculateOverround(probabilities);

    const fairProbabilities =
      removeVig(probabilities);

    setResult({
      probabilityA,
      probabilityB,
      fairProbabilityA:
        fairProbabilities[0],
      fairProbabilityB:
        fairProbabilities[1],
      overround,
    });
  }


  return (
    <div className="card mt-4">
      <div className="card-body">

        <h2 className="h4 mb-4">
          Bookmaker Margin Calculator
        </h2>

        <p className="text-muted">
          Enter the sportsbook odds for both
          outcomes in a two-outcome market.
        </p>

        {/* collect one price for each side of the market */}
        <form onSubmit={handleSubmit}>

          <div className="mb-3">

            <label
              htmlFor="outcome-a"
              className="form-label"
            >
              Outcome A Odds
            </label>

            <input
              id="outcome-a"
              type="number"
              className="form-control"
              value={outcomeA}
              onChange={(event) =>
                setOutcomeA(
                  event.target.value
                )
              }
            />

          </div>


          <div className="mb-3">

            <label
              htmlFor="outcome-b"
              className="form-label"
            >
              Outcome B Odds
            </label>

            <input
              id="outcome-b"
              type="number"
              className="form-control"
              value={outcomeB}
              onChange={(event) =>
                setOutcomeB(
                  event.target.value
                )
              }
            />

          </div>


          {/* keep any validation message close to the inputs */}
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}


          {/* calculate the margin and fair probabilities together */}
          <button
            type="submit"
            className="btn btn-primary"
          >
            Calculate Margin
          </button>

        </form>


        {/* only show this section after a valid calculation */}
        {result && (
          <div className="mt-4">

            <hr />

            <h3 className="h5">
              Market Analysis
            </h3>

            <p>
              Outcome A Implied Probability:{" "}
              <strong>
                {(
                  result.probabilityA *
                  100
                ).toFixed(2)}
                %
              </strong>
            </p>

            <p>
              Outcome B Implied Probability:{" "}
              <strong>
                {(
                  result.probabilityB *
                  100
                ).toFixed(2)}
                %
              </strong>
            </p>

            <p>
              Bookmaker Margin:{" "}
              <strong>
                {(
                  result.overround *
                  100
                ).toFixed(2)}
                %
              </strong>
            </p>

            <p>
              Outcome A Fair Probability:{" "}
              <strong>
                {(
                  result.fairProbabilityA *
                  100
                ).toFixed(2)}
                %
              </strong>
            </p>

            <p>
              Outcome B Fair Probability:{" "}
              <strong>
                {(
                  result.fairProbabilityB *
                  100
                ).toFixed(2)}
                %
              </strong>
            </p>

          </div>
        )}

      </div>
    </div>
  );
}

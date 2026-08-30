"use client";

import { useEffect, useState } from "react";

import {
    americanToProbability,
    calculateLossProbability,
    calculateParlayProbability,
    calculateCumulativeProbabilities,
    calculateCombinedDecimalOdds,
    calculatePotentialReturn,
    calculatePotentialProfit,
    classifyRisk,
} from "@/lib/bettingMath";

import ProbabilityChart from "@/components/ProbabilityChart";
import LossWarning from "@/components/LossWarning";


export default function BetForm() {
  const [stake, setStake] = useState("");

  const [legs, setLegs] = useState([
    "",
    "",
  ]);

  const [result, setResult] = useState<null | {
    winProbability: number;
    lossProbability: number;
    risk: string;
    legProbabilities: number[];
    cumulativeProbabilities: number[];
    combinedDecimalOdds: number;
    potentialReturn: number;
    potentialProfit: number;
  }>(null);

  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session");
        const session = await response.json();
        setIsLoggedIn(session.isLoggedIn === true);
      } catch {
        setIsLoggedIn(false);
      }
    }

    checkSession();
  }, []);

  function updateLeg(
    index: number,
    value: string
  ) {
    const updatedLegs = [...legs];

    updatedLegs[index] = value;

    setLegs(updatedLegs);
  }


  function addLeg() {
    setLegs([
      ...legs,
      "",
    ]);
  }


  function removeLeg(index: number) {
    if (legs.length <= 2) {
      return;
    }

    const updatedLegs = legs.filter(
      (_, legIndex) =>
        legIndex !== index
    );

    setLegs(updatedLegs);
  }


  function handleSubmit(
    event: React.SubmitEvent<HTMLFormElement>
  ) {
    event.preventDefault();
  
    setError("");
    setSaveMessage("");
  
    const stakeNumber = Number(stake);
  
    const oddsNumbers = legs.map(
      (leg) => Number(leg)
    );
  
    if (
      !Number.isFinite(stakeNumber) ||
      stakeNumber <= 0
    ) {
      setError("Please enter a valid stake greater than 0.");
      return;
    }
  
    const hasEmptyLeg = legs.some(
      (leg) => leg.trim() === ""
    );
  
    if (hasEmptyLeg) {
      setError("Please enter odds for every parlay leg.");
      return;
    }
  
    const invalidOdds = oddsNumbers.some(
      (odds) =>
        !Number.isFinite(odds) ||
        odds === 0
    );
  
    if (invalidOdds) {
      setError("Please enter valid American odds for every leg.");
      return;
    }
  
    const legProbabilities =
      oddsNumbers.map(
        (odds) =>
          americanToProbability(odds)
      );
  
    const winProbability =
      calculateParlayProbability(
        legProbabilities
      );
  
    const lossProbability =
      calculateLossProbability(
        winProbability
      );
  
    const cumulativeProbabilities =
      calculateCumulativeProbabilities(
        legProbabilities
      );

      const combinedDecimalOdds =
      calculateCombinedDecimalOdds(
        oddsNumbers
      );
    
    const potentialReturn =
      calculatePotentialReturn(
        stakeNumber,
        combinedDecimalOdds
      );
    
    const potentialProfit =
      calculatePotentialProfit(
        stakeNumber,
        combinedDecimalOdds
      );
    
    const risk =
      classifyRisk(
        winProbability
      );

    setResult({
      winProbability,
      lossProbability,
      risk,
      legProbabilities,
      cumulativeProbabilities,
      combinedDecimalOdds,
      potentialReturn,
      potentialProfit,
    });
  }


  async function saveAnalysis() {
    if (!result) {
      return;
    }
  
    setSaveMessage("");
  
    try {
      const response =
        await fetch(
          "/api/analyses",
          {
            method: "POST",
  
            headers: {
              "Content-Type":
                "application/json",
            },
  
            body: JSON.stringify({
              stake:
                Number(stake),
  
              legs:
                legs.map(
                  (leg) =>
                    Number(leg)
                ),
  
              winProbability:
                result.winProbability,
  
              lossProbability:
                result.lossProbability,
  
              risk:
                result.risk,

              legProbabilities:
                result.legProbabilities,

              cumulativeProbabilities:
                result.cumulativeProbabilities,

              combinedDecimalOdds:
                result.combinedDecimalOdds,

              potentialReturn:
                result.potentialReturn,

              potentialProfit:
                result.potentialProfit,

            }),
          }
        );

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
  
  
      if (!response.ok) {
        setSaveMessage(
          "Analysis could not be saved."
        );
  
        return;
      }
  
  
      setSaveMessage(
        "Analysis saved successfully."
      );
  
    } catch {
      setSaveMessage(
        "Analysis could not be saved."
      );
    }
  }


  return (
    <>
      <div className="card">
        <div className="card-body">

          <h2 className="h4 mb-4">
            Enter Parlay
          </h2>

          <form onSubmit={handleSubmit}>

            <div className="mb-4">

              <label
                htmlFor="stake"
                className="form-label"
              >
                Stake
              </label>

              <input
                id="stake"
                name="stake"
                type="number"
                min="0.01"
                step="0.01"
                className="form-control"
                value={stake}
                onChange={(event) =>
                  setStake(
                    event.target.value
                  )
                }
              />

            </div>


            <h3 className="h5">
              Parlay Legs
            </h3>


            {legs.map(
              (leg, index) => (
                <div
                  className="row mb-3"
                  key={index}
                >

                  <div className="col">

                    <label
                      htmlFor={`leg-${index}`}
                      className="form-label"
                    >
                      Leg {index + 1} Odds
                    </label>

                    <input
                      id={`leg-${index}`}
                      type="number"
                      className="form-control"
                      value={leg}
                      onChange={(event) =>
                        updateLeg(
                          index,
                          event.target.value
                        )
                      }
                    />

                  </div>


                  <div className="col-auto d-flex align-items-end">

                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() =>
                        removeLeg(index)
                      }
                      disabled={
                        legs.length <= 2
                      }
                    >
                      Remove
                    </button>

                  </div>

                </div>
              )
            )}

            {error && (
                <div className="alert alert-danger mt-3">
                    {error}
                </div>
            )}
            
            <button
              type="button"
              className="btn btn-outline-secondary me-2"
              onClick={addLeg}
            >
              + Add Leg
            </button>


            <button
              type="submit"
              className="btn btn-primary"
            >
              Analyse Parlay
            </button>

          </form>

        </div>
      </div>


      {result && (
        <div className="card mt-4">
          <div className="card-body">

            <h2 className="h4 mb-4">
              Parlay Analysis
            </h2>


            <p>
              Number of Legs:{" "}
              <strong>
                {result.legProbabilities.length}
              </strong>
            </p>

            <p>
                Combined Decimal Odds:{" "}
                <strong>
                    {result.combinedDecimalOdds.toFixed(2)}
                </strong>
            </p>

            <p>
                Potential Return:{" "}
                <strong>
                    ${result.potentialReturn.toFixed(2)}
                </strong>
            </p>

            <p>
                Potential Profit:{" "}
                <strong>
                    ${result.potentialProfit.toFixed(2)}
                </strong>
            </p>

            <p>
              Combined Win Probability:{" "}
              <strong>
                {(
                  result.winProbability *
                  100
                ).toFixed(2)}
                %
              </strong>
            </p>


            <p>
              Probability of Losing:{" "}
              <strong>
                {(
                  result.lossProbability *
                  100
                ).toFixed(2)}
                %
              </strong>
            </p>


            <p>
              Risk Classification:{" "}
              <strong>
                {result.risk}
              </strong>
            </p>


            <hr />


            <h3 className="h5">
              Individual Leg Probabilities
            </h3>


            <ul className="list-group mb-4">

              {result.legProbabilities.map(
                (probability, index) => (
                  <li
                    className="list-group-item d-flex justify-content-between"
                    key={index}
                  >

                    <span>
                      Leg {index + 1}
                    </span>

                    <strong>
                      {(
                        probability *
                        100
                      ).toFixed(2)}
                      %
                    </strong>

                  </li>
                )
              )}

            </ul>


            <h3 className="h5">
              Probability After Each Leg
            </h3>


            <ul className="list-group mb-4">

              {result.cumulativeProbabilities.map(
                (probability, index) => (
                  <li
                    className="list-group-item d-flex justify-content-between"
                    key={index}
                  >

                    <span>
                      After Leg {index + 1}
                    </span>

                    <strong>
                      {(
                        probability *
                        100
                      ).toFixed(2)}
                      %
                    </strong>

                  </li>
                )
              )}

            </ul>

            <ProbabilityChart
              probabilities={result.cumulativeProbabilities}
            />

            <LossWarning
              lossProbability={result.lossProbability}
            />

            {isLoggedIn ? (
              <button
                type="button"
                className="btn btn-success"
                onClick={saveAnalysis}
              >
                Save Analysis
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => {
                  window.location.href = "/login";
                }}
                disabled={isLoggedIn === null}
              >
                {isLoggedIn === null
                  ? "Checking Login..."
                  : "Log In to Save Analysis"}
              </button>
            )}

            {saveMessage && (
              <div className="alert alert-info mt-3">
                {saveMessage}
              </div>
            )}

          </div>
        </div>
      )}

    </>
  );
}

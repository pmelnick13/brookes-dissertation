// this is the main single bet and parlay form and results section
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
  // the inputs stay as strings until the form is submitted
  const [stake, setStake] = useState("");

  const [legs, setLegs] = useState([""]);

  // all calculated values are kept together after a valid submission
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
    // saving is only offered when there is an active login
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
    // copy the array so react can see that one leg changed
    const updatedLegs = [...legs];

    updatedLegs[index] = value;

    setLegs(updatedLegs);
  }


  function addLeg() {
    // a blank value gives the user another odds box to fill in
    setLegs([
      ...legs,
      "",
    ]);
  }


  function removeLeg(index: number) {
    // always leave one odds entry available for a single bet
    if (legs.length <= 1) {
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
    // keep everything on the page while the form is checked
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
      // a missing or negative stake cannot be calculated
      setError("Please enter a valid stake greater than 0.");
      return;
    }
  
    const hasEmptyLeg = legs.some(
      (leg) => leg.trim() === ""
    );
  
    if (hasEmptyLeg) {
      // do not let an empty box quietly turn into zero
      setError("Please enter odds for every selection.");
      return;
    }
  
    const invalidOdds = oddsNumbers.some(
      (odds) =>
        !Number.isFinite(odds) ||
        odds === 0
    );
  
    if (invalidOdds) {
      // american odds can be positive or negative but never zero
      setError("Please enter valid American odds for every leg.");
      return;
    }
  
    const legProbabilities =
      oddsNumbers.map(
        (odds) =>
          americanToProbability(odds)
      );
  
    // every leg has to win, so their probabilities are multiplied together
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
    
    // the final label keeps the raw percentage easy to understand
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
    // there is nothing useful to save until a result exists
    if (!result) {
      return;
    }
  
    setSaveMessage("");
  
    try {
      // the api links this data to the user from the secure session
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
        // an expired session needs a fresh login
        window.location.href = "/login";
        return;
      }
  
  
      if (!response.ok) {
        // keep failed saves on the page so they can be tried again
        setSaveMessage(
          "Analysis could not be saved."
        );
  
        return;
      }
  
  
      setSaveMessage(
        "Analysis saved successfully."
      );
  
    } catch {
      // use the same simple message for a network failure
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
            Enter Single Bet or Parlay
          </h2>

          {/* collect the stake and one american odds value per leg */}
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
              Odds Entries
            </h3>


            {/* build one input row for every leg in state */}
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
                      Selection {index + 1} Odds
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
                        legs.length <= 1
                      }
                    >
                      Remove
                    </button>

                  </div>

                </div>
              )
            )}

            {/* put validation feedback right beside the form */}
            {error && (
                <div className="alert alert-danger mt-3">
                    {error}
                </div>
            )}
            
            {/* add another blank leg without submitting */}
            <button
              type="button"
              className="btn btn-outline-secondary me-2"
              onClick={addLeg}
            >
              + Add Leg
            </button>


            {/* run all of the calculations with the current values */}
            <button
              type="submit"
              className="btn btn-primary"
            >
              Analyse Bet
            </button>

          </form>

        </div>
      </div>


      {/* results stay hidden until the inputs pass validation */}
      {result && (
        <div className="card mt-4">
          <div className="card-body">

            <h2 className="h4 mb-4">
              {result.legProbabilities.length === 1
                ? "Single Bet Analysis"
                : "Parlay Analysis"}
            </h2>


            <p>
              Number of Legs:{" "}
              <strong>
                {result.legProbabilities.length}
              </strong>
            </p>

            <p>
                {result.legProbabilities.length === 1
                  ? "Decimal Odds"
                  : "Combined Decimal Odds"}
                :{" "}
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
              {result.legProbabilities.length === 1
                ? "Win Probability"
                : "Combined Win Probability"}
              :{" "}
              <strong>
                {(result.winProbability * 100).toFixed(2)}%
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


            {/* list the probability implied by each individual leg */}
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
                      Selection {index + 1}
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


            {result.legProbabilities.length === 1 ? (
              <>
                <h3 className="h5">Probability After Each Leg</h3>
                <p>N/A for a single bet.</p>
              </>
            ) : (
              <>
                {/* show how the combined chance changes after every added leg */}
                <h3 className="h5">Probability After Each Leg</h3>

                <ul className="list-group mb-4">
                  {result.cumulativeProbabilities.map(
                    (probability, index) => (
                      <li
                        className="list-group-item d-flex justify-content-between"
                        key={index}
                      >
                        <span>After Leg {index + 1}</span>
                        <strong>
                          {(probability * 100).toFixed(2)}%
                        </strong>
                      </li>
                    )
                  )}
                </ul>

                {/* turn the cumulative values into a quick visual */}
                <ProbabilityChart
                  probabilities={result.cumulativeProbabilities}
                />
              </>
            )}

            {/* make the overall chance of losing the main warning */}
            <LossWarning
              lossProbability={result.lossProbability}
            />

            {/* logged-in users can save while guests get a login link */}
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

            {/* confirm whether the database save worked */}
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

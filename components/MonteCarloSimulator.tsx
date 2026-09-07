// this runs repeated bets and draws the balance as it changes
"use client";

import { useState } from "react";
import { americanToDecimal } from "@/lib/bettingMath";

type SimulationResult = {
  simulations: number;
  averageEndingBalance: number;
  medianEndingBalance: number;
  bestEndingBalance: number;
  worstEndingBalance: number;
  percentageEndingInLoss: number;
  percentageUnableToContinue: number;
  averageLongestLosingStreak: number;
  longestLosingStreak: number;
  endingBalances: number[];
  endingBalance: number;
  profitOrLoss: number;
  wins: number;
  losses: number;
  completedBets: number;
  balances: number[];
};

export default function MonteCarloSimulator() {
  // these strings are the six settings shown in the form
  const [startingBalance, setStartingBalance] = useState("1000");
  const [stake, setStake] = useState("10");
  const [numberOfBets, setNumberOfBets] = useState("100");
  const [numberOfSimulations, setNumberOfSimulations] = useState("1000");
  const [assumedWinProbability, setAssumedWinProbability] = useState("25");
  const [americanOdds, setAmericanOdds] = useState("200");
  // keep the latest run and any validation problem separate
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState("");

  function runSimulation(event: React.SubmitEvent<HTMLFormElement>) {
    // turn the form values into numbers before doing any random runs
    event.preventDefault();
    setError("");

    const balanceNumber = Number(startingBalance);
    const stakeNumber = Number(stake);
    const betsNumber = Number(numberOfBets);
    const simulationsNumber = Number(numberOfSimulations);
    const probabilityNumber = Number(assumedWinProbability);
    const americanOddsNumber = Number(americanOdds);

    if (!Number.isFinite(balanceNumber) || balanceNumber <= 0) {
      // the simulation needs some money to start with
      setError("Starting balance must be greater than 0.");
      return;
    }

    if (!Number.isFinite(stakeNumber) || stakeNumber <= 0) {
      // each bet needs a real positive stake
      setError("Stake must be greater than 0.");
      return;
    }

    if (stakeNumber > balanceNumber) {
      // the very first bet has to be affordable
      setError("Stake cannot be greater than the starting balance.");
      return;
    }

    if (!Number.isInteger(betsNumber) || betsNumber < 1 || betsNumber > 1000) {
      // the limit keeps the browser from doing silly amounts of work
      setError("Number of bets must be between 1 and 1,000.");
      return;
    }

    if (
      !Number.isInteger(simulationsNumber) ||
      simulationsNumber < 1 ||
      simulationsNumber > 5000
    ) {
      // this gives useful results without making the browser do too much work
      setError("Number of simulations must be between 1 and 5,000.");
      return;
    }

    if (
      !Number.isFinite(probabilityNumber) ||
      probabilityNumber <= 0 ||
      probabilityNumber >= 100
    ) {
      // zero and 100 would remove all randomness from the run
      setError("Assumed win probability must be between 0 and 100.");
      return;
    }

    if (!Number.isFinite(americanOddsNumber) || americanOddsNumber === 0) {
      // american odds can be positive or negative but never zero
      setError("Please enter valid American odds.");
      return;
    }

    // convert once so the payout calculation can stay simple during every run
    const decimalOddsNumber = americanToDecimal(americanOddsNumber);

    const endingBalances: number[] = [];
    let exampleEndingBalance = balanceNumber;
    let exampleWins = 0;
    let exampleLosses = 0;
    let exampleBalances = [balanceNumber];
    let simulationsEndingInLoss = 0;
    let simulationsUnableToContinue = 0;
    const longestLosingStreaks: number[] = [];

    // run the same betting setup many times so the outcomes can be compared
    for (let simulation = 0; simulation < simulationsNumber; simulation += 1) {
      let currentBalance = balanceNumber;
      let wins = 0;
      let losses = 0;
      let currentLosingStreak = 0;
      let longestLosingStreak = 0;
      const balances = [currentBalance];

      // each inner loop is one bet in the current simulation
      for (let bet = 0; bet < betsNumber; bet += 1) {
        if (currentBalance < stakeNumber) {
          break;
        }

        const betWon = Math.random() < probabilityNumber / 100;

        // wins add profit while losses remove the full stake
        if (betWon) {
          currentBalance += stakeNumber * (decimalOddsNumber - 1);
          wins += 1;
          currentLosingStreak = 0;
        } else {
          currentBalance -= stakeNumber;
          losses += 1;
          currentLosingStreak += 1;
          longestLosingStreak = Math.max(
            longestLosingStreak,
            currentLosingStreak
          );
        }

        balances.push(currentBalance);
      }

      endingBalances.push(currentBalance);
      longestLosingStreaks.push(longestLosingStreak);

      // compare the final balance with the starting point for this run
      if (currentBalance < balanceNumber) {
        simulationsEndingInLoss += 1;
      }

      // this means another bet at the chosen stake could not be placed
      if (currentBalance < stakeNumber) {
        simulationsUnableToContinue += 1;
      }

      // keep the first run as the example shown in the line chart
      if (simulation === 0) {
        exampleEndingBalance = currentBalance;
        exampleWins = wins;
        exampleLosses = losses;
        exampleBalances = balances;
      }
    }

    const sortedEndingBalances = [...endingBalances].sort(
      (first, second) => first - second
    );
    const middleIndex = Math.floor(sortedEndingBalances.length / 2);
    const medianEndingBalance =
      sortedEndingBalances.length % 2 === 0
        ? (sortedEndingBalances[middleIndex - 1] +
            sortedEndingBalances[middleIndex]) /
          2
        : sortedEndingBalances[middleIndex];
    const averageEndingBalance =
      endingBalances.reduce((total, balance) => total + balance, 0) /
      endingBalances.length;
    const averageLongestLosingStreak =
      longestLosingStreaks.reduce((total, streak) => total + streak, 0) /
      longestLosingStreaks.length;

    setResult({
      simulations: simulationsNumber,
      averageEndingBalance,
      medianEndingBalance,
      bestEndingBalance: Math.max(...endingBalances),
      worstEndingBalance: Math.min(...endingBalances),
      percentageEndingInLoss:
        (simulationsEndingInLoss / simulationsNumber) * 100,
      percentageUnableToContinue:
        (simulationsUnableToContinue / simulationsNumber) * 100,
      averageLongestLosingStreak,
      longestLosingStreak: Math.max(...longestLosingStreaks),
      endingBalances,
      endingBalance: exampleEndingBalance,
      profitOrLoss: exampleEndingBalance - balanceNumber,
      wins: exampleWins,
      losses: exampleLosses,
      completedBets: exampleWins + exampleLosses,
      balances: exampleBalances,
    });
  }

  return (
    <div className="row g-4">
      <div className="col-lg-5">
        <div className="card">
          <div className="card-body">
            <h2 className="h4 mb-4">Simulation Settings</h2>

            {/* each setting uses the same small number input component */}
            <form onSubmit={runSimulation}>
              <NumberInput
                id="starting-balance"
                label="Starting Balance ($)"
                value={startingBalance}
                onChange={setStartingBalance}
                min="0.01"
                step="0.01"
              />

              <NumberInput
                id="simulation-stake"
                label="Stake Per Bet ($)"
                value={stake}
                onChange={setStake}
                min="0.01"
                step="0.01"
              />

              <NumberInput
                id="number-of-bets"
                label="Number of Bets"
                value={numberOfBets}
                onChange={setNumberOfBets}
                min="1"
                max="1000"
                step="1"
              />

              <NumberInput
                id="number-of-simulations"
                label="Number of Simulations"
                value={numberOfSimulations}
                onChange={setNumberOfSimulations}
                min="1"
                max="5000"
                step="1"
              />

              <NumberInput
                id="assumed-win-probability"
                label="Assumed Win Probability (%)"
                value={assumedWinProbability}
                onChange={setAssumedWinProbability}
                min="0.01"
                max="99.99"
                step="0.01"
              />

              <p className="form-text mt-n2">
                Use the implied probability from the Analyse Bet page as a
                starting point, or enter your own scenario.
              </p>

              <NumberInput
                id="american-odds"
                label="American Odds"
                value={americanOdds}
                onChange={setAmericanOdds}
                step="1"
              />

              {/* show the first validation problem beside the form */}
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary">
                Run Simulation
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-lg-7">
        {/* swap the instructions for results after the first run */}
        {result ? (
          <SimulationResults result={result} />
        ) : (
          <div className="alert alert-info">
            Enter your settings and run the simulation to see the results.
          </div>
        )}
      </div>
    </div>
  );
}

type NumberInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  step: string;
};

function NumberInput({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
}: NumberInputProps) {
  // pass the browser's string value back to the matching state setter
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
      </label>

      <input
        id={id}
        type="number"
        className="form-control"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        min={min}
        max={max}
        step={step}
        required
      />
    </div>
  );
}

function SimulationResults({ result }: { result: SimulationResult }) {
  const chartWidth = 600;
  const chartHeight = 280;
  const padding = 40;
  const highestBalance = Math.max(...result.balances);
  const lowestBalance = Math.min(...result.balances);
  const balanceRange = highestBalance - lowestBalance || 1;

  // these points turn the balance history into a simple svg line
  const chartPoints = result.balances
    .map((balance, index) => {
      const x =
        padding +
        (index / Math.max(result.balances.length - 1, 1)) *
          (chartWidth - padding * 2);

      const y =
        padding +
        ((highestBalance - balance) / balanceRange) *
          (chartHeight - padding * 2);

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="h4 mb-4">Simulation Results</h2>

        <p className="text-muted">
          Summary across {result.simulations.toLocaleString()} simulations
        </p>

        <div className="row">
          <ResultItem
            label="Average Ending Balance"
            value={`$${result.averageEndingBalance.toFixed(2)}`}
          />
          <ResultItem
            label="Median Ending Balance"
            value={`$${result.medianEndingBalance.toFixed(2)}`}
          />
          <ResultItem
            label="Best Ending Balance"
            value={`$${result.bestEndingBalance.toFixed(2)}`}
          />
          <ResultItem
            label="Worst Ending Balance"
            value={`$${result.worstEndingBalance.toFixed(2)}`}
          />
        </div>

        <h3 className="h5 mt-3">Risk Across Simulations</h3>

        <div className="row">
          <ResultItem
            label="Simulations Ending in Loss"
            value={`${result.percentageEndingInLoss.toFixed(1)}%`}
          />
          <ResultItem
            label="Unable to Afford Another Stake"
            value={`${result.percentageUnableToContinue.toFixed(1)}%`}
          />
          <ResultItem
            label="Average Longest Losing Streak"
            value={result.averageLongestLosingStreak.toFixed(1)}
          />
          <ResultItem
            label="Longest Losing Streak Seen"
            value={String(result.longestLosingStreak)}
          />
        </div>

        <EndingBalanceChart balances={result.endingBalances} />

        <hr />

        <h3 className="h5">Example Simulation</h3>

        <div className="row">
          <ResultItem label="Ending Balance" value={`$${result.endingBalance.toFixed(2)}`} />
          <ResultItem label="Profit or Loss" value={`$${result.profitOrLoss.toFixed(2)}`} />
          <ResultItem label="Wins" value={String(result.wins)} />
          <ResultItem label="Losses" value={String(result.losses)} />
        </div>

        <p className="text-muted">
          Bets completed: {result.completedBets}
        </p>

        <h3 className="h5">Balance Over Time</h3>

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-100 border rounded bg-white"
          role="img"
          aria-label="Chart showing the simulated betting balance over time"
        >
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={chartHeight - padding}
            stroke="#6c757d"
          />

          <line
            x1={padding}
            y1={chartHeight - padding}
            x2={chartWidth - padding}
            y2={chartHeight - padding}
            stroke="#6c757d"
          />

          <polyline
            points={chartPoints}
            fill="none"
            stroke="#0d6efd"
            strokeWidth="3"
          />

          <text x="5" y={padding + 5} fontSize="12" fill="#6c757d">
            ${highestBalance.toFixed(0)}
          </text>

          <text x="5" y={chartHeight - padding + 5} fontSize="12" fill="#6c757d">
            ${lowestBalance.toFixed(0)}
          </text>

          <text
            x={chartWidth / 2}
            y={chartHeight - 8}
            textAnchor="middle"
            fontSize="12"
            fill="#6c757d"
          >
            Bets
          </text>
        </svg>
      </div>
    </div>
  );
}

function EndingBalanceChart({ balances }: { balances: number[] }) {
  const chartWidth = 600;
  const chartHeight = 280;
  const padding = 45;
  const numberOfBins = 10;
  const lowestBalance = Math.min(...balances);
  const highestBalance = Math.max(...balances);
  const balanceRange = highestBalance - lowestBalance;
  const binSize = balanceRange === 0 ? 1 : balanceRange / numberOfBins;

  // split all ending balances into ten equally sized groups
  const bins = Array.from({ length: numberOfBins }, (_, index) => ({
    minimum:
      balanceRange === 0 ? lowestBalance : lowestBalance + index * binSize,
    maximum:
      balanceRange === 0
        ? highestBalance
        : lowestBalance + (index + 1) * binSize,
    count: 0,
  }));

  balances.forEach((balance) => {
    const binIndex =
      balanceRange === 0
        ? 0
        : Math.min(
            Math.floor(((balance - lowestBalance) / balanceRange) * numberOfBins),
            numberOfBins - 1
          );

    bins[binIndex].count += 1;
  });

  const highestCount = Math.max(...bins.map((bin) => bin.count), 1);
  const graphWidth = chartWidth - padding * 2;
  const graphHeight = chartHeight - padding * 2;
  const barWidth = graphWidth / numberOfBins;

  return (
    <div className="mb-4">
      <h3 className="h5 mt-3">Ending Balance Distribution</h3>

      <p className="text-muted">
        Taller bars show the balance ranges where more simulations finished.
      </p>

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-100 border rounded bg-white"
        role="img"
        aria-label="Histogram showing the distribution of ending balances"
      >
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={chartHeight - padding}
          stroke="#6c757d"
        />

        <line
          x1={padding}
          y1={chartHeight - padding}
          x2={chartWidth - padding}
          y2={chartHeight - padding}
          stroke="#6c757d"
        />

        {/* draw one bar for each ending-balance range */}
        {bins.map((bin, index) => {
          const barHeight = (bin.count / highestCount) * graphHeight;
          const x = padding + index * barWidth + 2;
          const y = chartHeight - padding - barHeight;

          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={Math.max(barWidth - 4, 1)}
              height={barHeight}
              fill="#0d6efd"
            >
              <title>
                ${bin.minimum.toFixed(2)} to ${bin.maximum.toFixed(2)}: {bin.count} simulations
              </title>
            </rect>
          );
        })}

        <text x={padding} y={chartHeight - 15} fontSize="12" fill="#6c757d">
          ${lowestBalance.toFixed(0)}
        </text>

        <text
          x={chartWidth - padding}
          y={chartHeight - 15}
          textAnchor="end"
          fontSize="12"
          fill="#6c757d"
        >
          ${highestBalance.toFixed(0)}
        </text>

        <text x="8" y={padding + 5} fontSize="12" fill="#6c757d">
          {highestCount}
        </text>
      </svg>
    </div>
  );
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="col-sm-6 mb-3">
      <p className="text-muted mb-1">{label}</p>
      <strong className="fs-4">{value}</strong>
    </div>
  );
}

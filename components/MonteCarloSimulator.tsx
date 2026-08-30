"use client";

import { useState } from "react";

type SimulationResult = {
  endingBalance: number;
  profitOrLoss: number;
  wins: number;
  losses: number;
  completedBets: number;
  balances: number[];
};

export default function MonteCarloSimulator() {
  const [startingBalance, setStartingBalance] = useState("1000");
  const [stake, setStake] = useState("10");
  const [numberOfBets, setNumberOfBets] = useState("100");
  const [winProbability, setWinProbability] = useState("25");
  const [decimalOdds, setDecimalOdds] = useState("3.00");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState("");

  function runSimulation(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const balanceNumber = Number(startingBalance);
    const stakeNumber = Number(stake);
    const betsNumber = Number(numberOfBets);
    const probabilityNumber = Number(winProbability);
    const oddsNumber = Number(decimalOdds);

    if (!Number.isFinite(balanceNumber) || balanceNumber <= 0) {
      setError("Starting balance must be greater than 0.");
      return;
    }

    if (!Number.isFinite(stakeNumber) || stakeNumber <= 0) {
      setError("Stake must be greater than 0.");
      return;
    }

    if (stakeNumber > balanceNumber) {
      setError("Stake cannot be greater than the starting balance.");
      return;
    }

    if (!Number.isInteger(betsNumber) || betsNumber < 1 || betsNumber > 1000) {
      setError("Number of bets must be between 1 and 1,000.");
      return;
    }

    if (
      !Number.isFinite(probabilityNumber) ||
      probabilityNumber <= 0 ||
      probabilityNumber >= 100
    ) {
      setError("Win probability must be between 0 and 100.");
      return;
    }

    if (!Number.isFinite(oddsNumber) || oddsNumber <= 1) {
      setError("Decimal odds must be greater than 1.");
      return;
    }

    let currentBalance = balanceNumber;
    let wins = 0;
    let losses = 0;
    const balances = [currentBalance];

    for (let bet = 0; bet < betsNumber; bet += 1) {
      if (currentBalance < stakeNumber) {
        break;
      }

      const betWon = Math.random() < probabilityNumber / 100;

      if (betWon) {
        currentBalance += stakeNumber * (oddsNumber - 1);
        wins += 1;
      } else {
        currentBalance -= stakeNumber;
        losses += 1;
      }

      balances.push(currentBalance);
    }

    setResult({
      endingBalance: currentBalance,
      profitOrLoss: currentBalance - balanceNumber,
      wins,
      losses,
      completedBets: wins + losses,
      balances,
    });
  }

  return (
    <div className="row g-4">
      <div className="col-lg-5">
        <div className="card">
          <div className="card-body">
            <h2 className="h4 mb-4">Simulation Settings</h2>

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
                id="win-probability"
                label="Win Probability (%)"
                value={winProbability}
                onChange={setWinProbability}
                min="0.01"
                max="99.99"
                step="0.01"
              />

              <NumberInput
                id="decimal-odds"
                label="Decimal Odds"
                value={decimalOdds}
                onChange={setDecimalOdds}
                min="1.01"
                step="0.01"
              />

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
  min: string;
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

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="col-sm-6 mb-3">
      <p className="text-muted mb-1">{label}</p>
      <strong className="fs-4">{value}</strong>
    </div>
  );
}

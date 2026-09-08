// this is the main dashboard with summaries from saved analyses
"use client";

import { useEffect, useState } from "react";

type Analysis = {
  winProbability: number;
  risk: string;
};

type DashboardData = {
  betsAnalysed: number;
  averageWinProbability: number;
  averageLossProbability: number;
  highestRisk: string;
};

const emptyDashboard: DashboardData = {
  betsAnalysed: 0,
  averageWinProbability: 0,
  averageLossProbability: 0,
  highestRisk: "—",
};

const riskLevels = [
  "Higher implied chance, stake still at risk",
  "Moderate",
  "High",
  "Very High",
  "Extreme",
];

export default function Home() {
  // keep the summary, loading state, and any error separate
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // grab the saved bets once when the dashboard first opens
    async function loadDashboard() {
      try {
        const response = await fetch("/api/analyses");

        if (response.status === 401) {
          // guests can still see the empty dashboard without an error
          return;
        }

        if (!response.ok) {
          // send any other failed response to the catch block
          throw new Error("Failed to load dashboard");
        }

        const analyses: Analysis[] = await response.json();

        if (analyses.length === 0) {
          // the default values already cover an empty account
          return;
        }

        const totalWinProbability = analyses.reduce(
          (total, analysis) => total + analysis.winProbability,
          0
        );

        // the order here makes it easy to pick the strongest risk label
        const highestRisk = analyses.reduce(
          (highest, analysis) => {
            const currentLevel = riskLevels.indexOf(analysis.risk);
            const highestLevel = riskLevels.indexOf(highest);

            return currentLevel > highestLevel ? analysis.risk : highest;
          },
          "Higher implied chance, stake still at risk"
        );

        setDashboard({
          betsAnalysed: analyses.length,
          averageWinProbability: totalWinProbability / analyses.length,
          averageLossProbability:
            1 - totalWinProbability / analyses.length,
          highestRisk,
        });
      } catch {
        // keep database or network details away from the page
        setError("Dashboard data could not be loaded.");
      } finally {
        // stop the placeholders once the request has finished
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <main className="container py-5">
      <div className="mb-5">
        <h1 className="fw-bold">
          Sports Betting Transparency Dashboard
        </h1>

        <p className="text-muted">
          Understand the probability and financial risk behind sportsbook odds and parlays.
        </p>
      </div>

      {/* only show the red message if loading failed */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* these cards turn the saved records into quick summaries */}
      <div className="row g-4">
        <div className="col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <p className="text-muted mb-2">
                Bets Analysed
              </p>

              <h2>
                {isLoading ? "..." : dashboard.betsAnalysed}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <p className="text-muted mb-2">
                Average Win Probability
              </p>

              <h2>
                {isLoading
                  ? "..."
                  : `${(dashboard.averageWinProbability * 100).toFixed(1)}%`}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <p className="text-muted mb-2">
                Average Loss Probability
              </p>

              <h2>
                {isLoading
                  ? "..."
                  : `${(dashboard.averageLossProbability * 100).toFixed(1)}%`}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <p className="text-muted mb-2">
                Highest Risk
              </p>

              <h2>
                {isLoading ? "..." : dashboard.highestRisk}
              </h2>
            </div>
          </div>
        </div>
      </div>

       {/* finish with a clear way into the main calculator */}
       <div className="card mt-5">
        <div className="card-body p-4">
          <h2 className="h4">
            Understand the real risk behind your bet
          </h2>

          <p>
            Enter sportsbook odds and the dashboard will translate them into understandable probability and risk metrics.
          </p>

          <a
            href="/analyse"
            className="btn btn-primary"
          >
            Analyse a Bet
          </a>
        </div>
      </div>
    </main>
  );
}

// this page loads the user's saved bet analyses
"use client";

import { useEffect, useState } from "react";

type Analysis = {
  _id: string;
  createdAt: string;
  stake: number;
  legs: number[];
  winProbability: number;
  risk: string;
};

export default function HistoryPage() {
  // keep the records and the two request states separate
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // load this account's records when the page first opens
    async function loadAnalyses() {
      try {
        const response = await fetch("/api/analyses");

        if (response.status === 401) {
          // history is private, so guests are sent to login
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          // let the catch block handle any other server failure
          throw new Error("Failed to load analyses");
        }

        const data: Analysis[] = await response.json();
        setAnalyses(data);
      } catch {
        // show a readable message instead of technical details
        setError("Bet history could not be loaded.");
      } finally {
        // stop the loading message whether the request worked or not
        setIsLoading(false);
      }
    }

    loadAnalyses();
  }, []);

  return (
    <main className="container py-5">
      <h1>Bet History</h1>

      <p className="text-muted">
        Your saved bet analyses appear here.
      </p>

      {/* show one clear state at a time while data is loading */}
      {isLoading && (
        <p>Loading bet history...</p>
      )}

      {/* this only appears if the request failed */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* explain when the account has no saved bets yet */}
      {!isLoading && !error && analyses.length === 0 && (
        <div className="alert alert-info">
          No saved analyses yet.
        </div>
      )}

      {/* build the table once there are records to show */}
      {!isLoading && !error && analyses.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Date</th>
                <th>Stake</th>
                <th>Legs</th>
                <th>Win Probability</th>
                <th>Risk</th>
              </tr>
            </thead>

            <tbody>
              {/* each saved analysis gets one row */}
              {analyses.map((analysis) => (
                <tr key={analysis._id}>
                  <td>
                    {new Date(analysis.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    ${analysis.stake.toFixed(2)}
                  </td>
                  <td>{analysis.legs.length}</td>
                  <td>
                    {(analysis.winProbability * 100).toFixed(2)}%
                  </td>
                  <td>{analysis.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

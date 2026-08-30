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
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalyses() {
      try {
        const response = await fetch("/api/analyses");

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load analyses");
        }

        const data: Analysis[] = await response.json();
        setAnalyses(data);
      } catch {
        setError("Bet history could not be loaded.");
      } finally {
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

      {isLoading && (
        <p>Loading bet history...</p>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {!isLoading && !error && analyses.length === 0 && (
        <div className="alert alert-info">
          No saved analyses yet.
        </div>
      )}

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

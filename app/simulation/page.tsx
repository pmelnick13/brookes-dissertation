import MonteCarloSimulator from "@/components/MonteCarloSimulator";

export default function SimulationPage() {
  return (
    <main className="container py-5">
      <div className="mb-4">
        <h1>Bankroll Simulation</h1>

        <p className="text-muted">
          See how repeated bets could change a betting balance over time.
        </p>
      </div>

      <MonteCarloSimulator />
    </main>
  );
}

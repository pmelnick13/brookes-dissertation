// this page holds the repeated-betting simulation
import MonteCarloSimulator from "@/components/MonteCarloSimulator";

export default function SimulationPage() {
  return (
    <main className="container py-5">
      {/* give a little context before showing all the settings */}
      <div className="mb-4">
        <h1>Bankroll Simulation</h1>

        <p className="text-muted">
          Compare many possible outcomes from repeatedly placing similar bets.
        </p>
      </div>

      {/* the component below handles the form, maths, and chart */}
      <MonteCarloSimulator />
    </main>
  );
}

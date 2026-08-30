import BetForm from "@/components/BetForm";
import MarginCalculator from "@/components/MarginCalculator";

export default function AnalysePage() {
  return (
    <main className="container py-5">

      <div className="mb-4">
        <h1>Analyse Bet</h1>

        <p className="text-muted">
          Enter sportsbook odds to understand
          their probability and financial risk.
        </p>
      </div>

      <div className="row">

        <div className="col-lg-7">

          <BetForm />

          <MarginCalculator />

        </div>

      </div>

    </main>
  );
}

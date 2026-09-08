// these are the two calculators used on the analyse page
import BetForm from "@/components/BetForm";
import MarginCalculator from "@/components/MarginCalculator";

export default function AnalysePage() {
  return (
    <main className="container py-5">

      {/* start with a quick explanation of what this page does */}
      <div className="mb-4">
        <h1>Analyse Single Bet or Parlay</h1>

        <p className="text-muted">
          Enter one sportsbook price for a single bet or add more
          selections to analyse a parlay.
        </p>
      </div>

      <div className="row">

        <div className="col-lg-7">

          {/* this handles both single bets and parlays */}
          <BetForm />

          {/* this handles a separate two-outcome market */}
          <MarginCalculator />

        </div>

      </div>

    </main>
  );
}

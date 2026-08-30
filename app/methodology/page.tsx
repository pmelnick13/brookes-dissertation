// this page explains the maths and assumptions behind the results
export default function MethodologyPage() {
  return (
    <main className="container py-5">
      <div className="mb-5">
        <h1>Methodology</h1>

        <p className="text-muted">
          This page explains how the application calculates probability, financial results, and risk.
        </p>
      </div>

      {/* start with the basic conversion used by the other calculations */}
      <MethodSection title="1. Converting American Odds">
        <p>
          American odds are converted into decimal odds before returns are calculated.
        </p>

        <Formula>
          Positive odds: Decimal odds = 1 + (American odds ÷ 100)
        </Formula>

        <Formula>
          Negative odds: Decimal odds = 1 + (100 ÷ absolute American odds)
        </Formula>

        <p className="mb-0">
          Example: +200 becomes decimal odds of 3.00.
        </p>
      </MethodSection>

      {/* explain how the sportsbook price becomes a percentage */}
      <MethodSection title="2. Implied Probability">
        <p>
          Implied probability is the chance of an outcome suggested by the sportsbook odds.
        </p>

        <Formula>
          Positive odds: Probability = 100 ÷ (odds + 100)
        </Formula>

        <Formula>
          Negative odds: Probability = absolute odds ÷ (absolute odds + 100)
        </Formula>

        <p className="mb-0">
          The result is stored as a decimal. For example, 0.25 is displayed as 25%.
        </p>
      </MethodSection>

      {/* show why adding legs quickly lowers the overall chance */}
      <MethodSection title="3. Parlay Probability">
        <p>
          The application multiplies the implied probability of every leg.
        </p>

        <Formula>
          Parlay probability = Leg 1 probability × Leg 2 probability × ...
        </Formula>

        <p className="mb-0">
          The loss probability is 1 minus the parlay win probability.
        </p>
      </MethodSection>

      {/* separate the full return from the actual profit */}
      <MethodSection title="4. Potential Return and Profit">
        <Formula>
          Potential return = Stake × Combined decimal odds
        </Formula>

        <Formula>
          Potential profit = Stake × (Combined decimal odds − 1)
        </Formula>

        <p className="mb-0">
          Return includes the original stake. Profit does not include the returned stake.
        </p>
      </MethodSection>

      {/* explain how the two-outcome margin is removed */}
      <MethodSection title="5. Bookmaker Margin">
        <p>
          The margin calculator is designed for a market with two possible outcomes.
        </p>

        <Formula>
          Bookmaker margin = Total implied probability − 100%
        </Formula>

        <Formula>
          Fair probability = Outcome probability ÷ Total implied probability
        </Formula>

        <p className="mb-0">
          This proportional method removes the margin so the two fair probabilities total 100%.
        </p>
      </MethodSection>

      {/* list the simple thresholds used for the risk labels */}
      <MethodSection title="6. Risk Classification">
        <div className="table-responsive">
          <table className="table table-bordered mb-0">
            <thead>
              <tr>
                <th>Win Probability</th>
                <th>Risk</th>
              </tr>
            </thead>

            <tbody>
              <tr><td>50% or higher</td><td>Lower</td></tr>
              <tr><td>30% to below 50%</td><td>Moderate</td></tr>
              <tr><td>15% to below 30%</td><td>High</td></tr>
              <tr><td>5% to below 15%</td><td>Very High</td></tr>
              <tr><td>Below 5%</td><td>Extreme</td></tr>
            </tbody>
          </table>
        </div>
      </MethodSection>

      {/* describe what happens during each simulated bet */}
      <MethodSection title="7. Monte Carlo Simulation">
        <p>
          The simulation generates a random number for every bet. The bet wins when that number falls within the chosen win probability.
        </p>

        <p className="mb-0">
          A win adds the potential profit to the balance. A loss removes the stake. The simulation stops early if the balance becomes too low to place another bet.
        </p>
      </MethodSection>

      {/* collect the important assumptions in one obvious place */}
      <section className="card border-warning">
        <div className="card-body">
          <h2 className="h4">Important Limitations</h2>

          <ul className="mb-0">
            <li>
              Parlay legs are treated as independent. The calculation does not account for related or correlated outcomes.
            </li>
            <li>
              Parlay calculations use probabilities implied by sportsbook odds. These may include a bookmaker margin.
            </li>
            <li>
              Expected value uses the implied probability, not an independently researched prediction of the true probability.
            </li>
            <li>
              A single simulation is only one possible outcome and will change each time it runs.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}

function MethodSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  // reuse one card layout for every part of the explanation
  return (
    <section className="card mb-4">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        {children}
      </div>
    </section>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  // formulas get their own box so they are easy to spot
  return (
    <div className="bg-light border rounded p-3 mb-3">
      <code className="text-dark">{children}</code>
    </div>
  );
}

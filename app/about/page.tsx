export default function AboutPage() {
  return (
    <main className="container py-5">
      <div className="mb-5">
        <h1>About This Project</h1>

        <p className="text-muted">
          This application is a dissertation project about sports betting probability and risk.
        </p>
      </div>

      <section className="card mb-4">
        <div className="card-body">
          <h2 className="h4">Project Aim</h2>

          <p className="mb-0">
            Sportsbook odds can make risky bets appear more attractive or easier to win than they are. This project converts odds into clear probabilities and financial results so users can better understand the risk behind a bet.
          </p>
        </div>
      </section>

      <section className="card mb-4">
        <div className="card-body">
          <h2 className="h4">What the Application Does</h2>

          <ul className="mb-0">
            <li>Converts American odds into implied probabilities.</li>
            <li>Calculates combined parlay probability and risk.</li>
            <li>Shows potential returns, profit, and loss probability.</li>
            <li>Explains bookmaker margin in two-outcome markets.</li>
            <li>Saves completed analyses and displays bet history.</li>
            <li>Simulates how repeated bets could affect a balance.</li>
            <li>Compares very small probabilities with rare real-world events.</li>
          </ul>
        </div>
      </section>

      <section className="card mb-4">
        <div className="card-body">
          <h2 className="h4">What the Application Does Not Do</h2>

          <ul className="mb-0">
            <li>It does not predict which teams or players will win.</li>
            <li>It does not recommend which bets to place.</li>
            <li>It cannot guarantee a profit or prevent a loss.</li>
            <li>It should not be treated as financial or gambling advice.</li>
          </ul>
        </div>
      </section>

      <section className="card border-warning mb-4">
        <div className="card-body">
          <h2 className="h4">Responsible Gambling</h2>

          <p>
            Gambling always involves risk. A calculation can explain that risk, but it cannot make gambling safe or guarantee a result.
          </p>

          <ul className="mb-0">
            <li>Only gamble with money you can afford to lose.</li>
            <li>Do not treat gambling as a way to make money.</li>
            <li>Set limits on the money and time you spend.</li>
            <li>Do not chase losses by placing more or larger bets.</li>
            <li>Take a break and seek support if gambling causes stress, debt, or relationship problems.</li>
          </ul>
        </div>
      </section>

      <section className="card border-danger">
        <div className="card-body">
          <h2 className="h4">Help and Support</h2>

          <p>
            Free and confidential support is available if gambling is causing problems for you or someone you know.
          </p>

          <div className="row g-3">
            <SupportItem
              title="National Gambling Helpline"
              description="Available free, 24 hours a day. England and Scotland: 0808 8020 133. Wales: 0808 2819 265."
              link="https://www.gamblingcommission.gov.uk/public-and-players/page/free-multi-operator-and-national-self-exclusion-schemes"
              linkText="National Gambling Helpline information"
            />

            <SupportItem
              title="NHS Gambling Support"
              description="Information about warning signs, treatment, and specialist NHS gambling clinics."
              link="https://www.nhs.uk/live-well/addiction-support/gambling-addiction/"
              linkText="Visit the NHS support page"
            />

            <SupportItem
              title="GAMSTOP"
              description="A free service that blocks access to gambling websites and apps licensed in Great Britain."
              link="https://www.gamstop.co.uk/"
              linkText="Visit GAMSTOP"
            />
          </div>

          <div className="alert alert-danger mt-4 mb-0">
            If gambling is seriously affecting your mental health or you are in immediate danger, use the urgent help information on the NHS website or call 999.
          </div>
        </div>
      </section>
    </main>
  );
}

function SupportItem({
  title,
  description,
  link,
  linkText,
}: {
  title: string;
  description: string;
  link: string;
  linkText: string;
}) {
  return (
    <div className="col-md-4">
      <div className="border rounded p-3 h-100">
        <h3 className="h5">{title}</h3>
        <p>{description}</p>
        <a href={link} target="_blank" rel="noreferrer">
          {linkText}
        </a>
      </div>
    </div>
  );
}

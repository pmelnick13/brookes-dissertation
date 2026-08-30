// this makes the chance of losing hard to miss
type LossWarningProps = {
  lossProbability: number;
};

export default function LossWarning({
  lossProbability,
}: LossWarningProps) {
  // keep the displayed percentage at two decimal places
  const percentage = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(lossProbability * 100);

  return (
    // the red alert makes the main risk stand out from the other results
    <div
      className="alert alert-danger text-center py-5 mb-4"
      role="alert"
    >
      <p className="fs-4 mb-2">
        Chance of Losing
      </p>

      <strong className="display-1">
        {percentage}%
      </strong>
    </div>
  );
}

interface ProgressSummaryProps {
  organizerRemaining: number;
  safetyRemaining: number;
}

export default function ProgressSummary({ organizerRemaining, safetyRemaining }: ProgressSummaryProps) {
  return (
    <div className="progress-summary" aria-live="polite">
      <span className="progress-summary__mark" aria-hidden="true">✓</span>
      <p>
        <strong>{organizerRemaining} organizer {organizerRemaining === 1 ? "requirement" : "requirements"}</strong>
        {" and "}
        <strong>{safetyRemaining} safety {safetyRemaining === 1 ? "check" : "checks"}</strong>
        {" remaining."}
      </p>
    </div>
  );
}

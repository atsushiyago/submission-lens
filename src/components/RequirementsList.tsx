import type { OrganizerRequirement } from "../shared/analysis";

interface RequirementsListProps {
  requirements: OrganizerRequirement[];
  completedIds: Set<string>;
  onToggle: (id: string) => void;
}

export default function RequirementsList({ requirements, completedIds, onToggle }: RequirementsListProps) {
  if (requirements.length === 0) {
    return (
      <div className="empty-result">
        <span className="empty-result__mark" aria-hidden="true">✓</span>
        <div>
          <h3>No event-specific requirements identified</h3>
          <p>We couldn’t identify any submission requirements in this text. Try pasting a more complete section of the rules.</p>
        </div>
      </div>
    );
  }

  return (
    <ul className="requirement-list">
      {requirements.map((requirement) => {
        const checked = completedIds.has(requirement.id);
        return (
          <li className={`requirement ${checked ? "requirement--complete" : ""}`} key={requirement.id}>
            <label className="requirement__main">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(requirement.id)}
                aria-label={`Mark ${requirement.title} complete`}
              />
              <span className="requirement__title">{requirement.title}</span>
            </label>
            <div className="requirement__meta">
              <span className="category-tag">{requirement.category}</span>
              {requirement.needsReview && <span className="review-tag">Needs review</span>}
            </div>
            <div className="source-note">
              <span className="source-note__label">Source</span>
              <p>{requirement.sourceExcerpt ?? "No matching source excerpt found."}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

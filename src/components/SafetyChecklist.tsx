import { SAFETY_CHECKS } from "../data/safetyChecks";

interface SafetyChecklistProps {
  completedIds: Set<string>;
  onToggle: (id: string) => void;
}

export default function SafetyChecklist({ completedIds, onToggle }: SafetyChecklistProps) {
  return (
    <ul className="requirement-list">
      {SAFETY_CHECKS.map((check) => {
        const id = `safety:${check.id}`;
        const checked = completedIds.has(id);
        return (
          <li className={`requirement safety-check ${checked ? "requirement--complete" : ""}`} key={check.id}>
            <label className="requirement__main">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(id)}
                aria-label={`Mark ${check.title} complete`}
              />
              <span className="requirement__title">{check.title}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

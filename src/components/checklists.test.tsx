import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ProgressSummary from "./ProgressSummary";
import RequirementsList from "./RequirementsList";
import SafetyChecklist from "./SafetyChecklist";

describe("checklist sections", () => {
  it("keeps the safety recommendations visible when no organizer requirements are found", () => {
    const organizer = renderToStaticMarkup(
      <RequirementsList requirements={[]} completedIds={new Set()} onToggle={() => undefined} />,
    );
    const safety = renderToStaticMarkup(<SafetyChecklist completedIds={new Set()} onToggle={() => undefined} />);

    expect(organizer).toContain("No event-specific requirements identified");
    expect(safety).toContain("Open production URLs while logged out");
    expect(safety).toContain("Reopen every link in the final submission");
    expect((safety.match(/type="checkbox"/g) ?? [])).toHaveLength(6);
  });

  it("shows changing remaining counts in the page summary", () => {
    const summary = renderToStaticMarkup(<ProgressSummary organizerRemaining={2} safetyRemaining={3} />);

    expect(summary).toContain("2 organizer requirements");
    expect(summary).toContain("3 safety checks");
    expect(summary).toContain("remaining.");
  });
});

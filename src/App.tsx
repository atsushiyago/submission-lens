import { useState, type FormEvent } from "react";
import RequirementsList from "./components/RequirementsList";
import { AnalyzeRequestError, analyzeRules } from "./lib/analyze";
import { MAX_RULE_CHARACTERS, countCharacters, type AnalysisResponse } from "./shared/analysis";

const EMPTY_INPUT_MESSAGE = "Paste some hackathon rules or submission requirements before analyzing.";
const OVER_LIMIT_MESSAGE = "Rules must be 50,000 characters or fewer.";

export default function App() {
  const [rulesText, setRulesText] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const characterCount = countCharacters(rulesText);

  async function handleAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInputError(null);
    setAnalysisError(null);

    if (!rulesText.trim()) {
      setInputError(EMPTY_INPUT_MESSAGE);
      return;
    }

    if (characterCount > MAX_RULE_CHARACTERS) {
      setInputError(OVER_LIMIT_MESSAGE);
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeRules(rulesText);
      setAnalysis(result);
      setCompletedIds(new Set());
    } catch (error) {
      setAnalysisError(
        error instanceof AnalyzeRequestError ? error.message : "Analysis failed. Please try again.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  function toggleRequirement(id: string) {
    setCompletedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Submission Lens home">
          <span className="brand__symbol" aria-hidden="true">S</span>
          <span>Submission Lens</span>
        </a>
        <span className="header-note">A clearer path to submit</span>
      </header>

      <section className="intro" id="top" aria-labelledby="page-title">
        <p className="eyebrow">HACKATHON SUBMISSION PLANNER</p>
        <h1 id="page-title">Make the final details easier to catch.</h1>
        <p className="intro__copy">
          Turn long hackathon rules into an actionable checklist, alongside practical submission safety checks.
        </p>
      </section>

      <section className="workspace" aria-label="Analyze hackathon rules">
        <form className="input-card" onSubmit={handleAnalyze}>
          <div className="section-heading section-heading--form">
            <div>
              <p className="eyebrow">STEP 1</p>
              <h2>Paste the rules</h2>
            </div>
            <span className="text-count" aria-live="polite">
              {characterCount.toLocaleString()} / {MAX_RULE_CHARACTERS.toLocaleString()}
            </span>
          </div>
          <label className="visually-hidden" htmlFor="rules-text">Hackathon rules and submission requirements</label>
          <textarea
            id="rules-text"
            value={rulesText}
            onChange={(event) => {
              setRulesText(event.target.value);
              if (inputError) setInputError(null);
            }}
            placeholder="Paste the rules or submission requirements here..."
            rows={10}
            aria-describedby="privacy-note input-message"
          />
          <div className="form-footer">
            <div className="privacy-note" id="privacy-note">
              <span className="privacy-note__icon" aria-hidden="true">i</span>
              <span>Do not paste confidential, sensitive, or personal information.</span>
            </div>
            <button className="analyze-button" type="submit" disabled={isAnalyzing}>
              {isAnalyzing ? (
                <><span className="spinner" aria-hidden="true" /> Analyzing…</>
              ) : (
                <>Analyze rules <span aria-hidden="true">↗</span></>
              )}
            </button>
          </div>
          <div className="inline-message-slot" id="input-message" aria-live="polite">
            {inputError && <p className="inline-message inline-message--input">{inputError}</p>}
            {analysisError && <p className="inline-message inline-message--error">{analysisError}</p>}
          </div>
        </form>

        <p className="source-explainer">
          <span className="source-explainer__dot" aria-hidden="true" />
          Organizer requirements are kept separate from general submission safety recommendations.
        </p>
      </section>

      {analysis && (
        <section className="results-section" aria-labelledby="organizer-heading">
          <div className="results-heading">
            <div>
              <p className="eyebrow">STEP 2 · REVIEW YOUR LIST</p>
              <h2 id="organizer-heading">Organizer Requirements</h2>
            </div>
            <span className="section-chip">From event rules</span>
          </div>
          <RequirementsList
            requirements={analysis.requirements}
            completedIds={completedIds}
            onToggle={toggleRequirement}
          />
        </section>
      )}

      <footer className="page-footer">
        <span className="footer-mark" aria-hidden="true">S</span>
        <span>Designed to help you submit with confidence.</span>
      </footer>
    </main>
  );
}

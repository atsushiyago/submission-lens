export interface SafetyCheck {
  id: string;
  title: string;
}

export const SAFETY_CHECKS: SafetyCheck[] = [
  { id: "production-url", title: "Open production URLs while logged out" },
  { id: "public-repository", title: "Confirm the repository is public" },
  { id: "secrets", title: "Check that no secrets are exposed" },
  { id: "build-tests", title: "Confirm the build and tests pass" },
  { id: "licenses", title: "Check licenses for code, assets, and dependencies" },
  { id: "submission-links", title: "Reopen every link in the final submission" },
];

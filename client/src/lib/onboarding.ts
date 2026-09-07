export function shouldShowOnboarding(entryCount: number, isTeamAccess: boolean): boolean {
  return isTeamAccess || entryCount < 3;
}

export function nextOnboardingEntryCount(entryCount: number, isTeamAccess: boolean): number {
  return shouldShowOnboarding(entryCount, isTeamAccess) ? entryCount + 1 : entryCount;
}

export type OnboardingAction = "close" | "skip" | "open_tutorial";

export function resolveOnboardingAction(action: OnboardingAction): { shouldRemainOpen: false; destination?: "/tutorial" } {
  return action === "open_tutorial"
    ? { shouldRemainOpen: false, destination: "/tutorial" }
    : { shouldRemainOpen: false };
}

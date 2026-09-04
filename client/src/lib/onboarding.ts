export function shouldShowOnboarding(entryCount: number, isTeamAccess: boolean): boolean {
  return isTeamAccess || entryCount < 3;
}

export function nextOnboardingEntryCount(entryCount: number, isTeamAccess: boolean): number {
  return shouldShowOnboarding(entryCount, isTeamAccess) ? entryCount + 1 : entryCount;
}

export type DeletionStage = "confirm" | "danger" | null;

export function deletionStageAfter(action: "start" | "advance" | "cancel"): DeletionStage {
  if (action === "start") return "confirm";
  if (action === "advance") return "danger";
  return null;
}

export function deletionNameMatches(propertyName: string, enteredName: string): boolean {
  return propertyName.trim().toLocaleLowerCase("pt-BR") === enteredName.trim().toLocaleLowerCase("pt-BR");
}

export function visibleTerritoryItems<T extends { standId: number }>(items: T[], selectedStandId: number | null): T[] {
  return selectedStandId === null ? items : items.filter(item => item.standId === selectedStandId);
}

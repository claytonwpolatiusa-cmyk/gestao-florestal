export function validateAreaDraft(input: { name: string; municipality: string; state: string; boundaryFileName?: string }) {
  if (input.name.trim().length < 2) return "Informe o nome da área.";
  if (input.municipality.trim().length < 2) return "Informe a cidade ou município.";
  if (input.state.trim().length !== 2) return "Selecione o estado.";
  if (input.boundaryFileName && !input.boundaryFileName.toLowerCase().endsWith(".kml")) return "Envie o limite da Área em arquivo KML.";
  return null;
}

export function validateStandDraft(input: { propertyId: number; code: string; species: string; areaHa: number | null }) {
  if (!Number.isInteger(input.propertyId) || input.propertyId <= 0) return "Escolha a Área onde o talhão será desenhado.";
  if (input.code.trim().length < 2) return "Informe o código do talhão.";
  if (input.species !== "pinus" && input.species !== "eucalipto") return "Selecione a cultura do talhão.";
  if (!input.areaHa || input.areaHa <= 0) return "Desenhe o limite do talhão no mapa para calcular os hectares.";
  return null;
}

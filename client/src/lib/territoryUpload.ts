const MAP_EXTENSIONS = [".kml", ".kmz", ".geojson", ".json"];
const MAX_MAP_FILE_SIZE = 3_000_000;

export function mapFileValidationError(file?: Pick<File, "name" | "size">): string | null {
  if (!file) return null;
  if (file.size > MAX_MAP_FILE_SIZE) return "O arquivo de mapa deve ter até 3 MB.";
  const lowerName = file.name.trim().toLowerCase();
  if (!MAP_EXTENSIONS.some(extension => lowerName.endsWith(extension))) return "Envie um arquivo KML, GeoJSON ou KMZ.";
  return null;
}

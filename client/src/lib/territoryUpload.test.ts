import { describe, expect, it } from "vitest";
import { mapFileValidationError } from "./territoryUpload";

describe("validação de arquivo de mapa", () => {
  it("aceita KML, GeoJSON e KMZ dentro do limite", () => {
    expect(mapFileValidationError({ name: "talhao.kml", size: 500 })).toBeNull();
    expect(mapFileValidationError({ name: "talhao.geojson", size: 500 })).toBeNull();
    expect(mapFileValidationError({ name: "talhao.kmz", size: 500 })).toBeNull();
  });

  it("rejeita extensão não geográfica e arquivo acima do limite", () => {
    expect(mapFileValidationError({ name: "planilha.xlsx", size: 500 })).toBe("Envie um arquivo KML, GeoJSON ou KMZ.");
    expect(mapFileValidationError({ name: "limite.kml", size: 3_000_001 })).toBe("O arquivo de mapa deve ter até 3 MB.");
  });
});

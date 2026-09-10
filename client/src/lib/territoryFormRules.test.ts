import { describe, expect, it } from "vitest";
import { validateAreaDraft, validateStandDraft } from "./territoryFormRules";

describe("territory form rules", () => {
  it("aceita uma Área com campos essenciais e KML opcional", () => {
    expect(validateAreaDraft({ name: "Área Norte", municipality: "Lages", state: "SC" })).toBeNull();
    expect(validateAreaDraft({ name: "Área Norte", municipality: "Lages", state: "SC", boundaryFileName: "limite.kml" })).toBeNull();
  });

  it("rejeita Área sem identificação ou arquivo de limite incompatível", () => {
    expect(validateAreaDraft({ name: "", municipality: "Lages", state: "SC" })).toMatch(/nome/i);
    expect(validateAreaDraft({ name: "Área Norte", municipality: "", state: "SC" })).toMatch(/município/i);
    expect(validateAreaDraft({ name: "Área Norte", municipality: "Lages", state: "SC", boundaryFileName: "limite.geojson" })).toMatch(/KML/i);
  });

  it("exige Área, código, cultura e desenho válido para o Talhão", () => {
    expect(validateStandDraft({ propertyId: 3, code: "T-01", species: "pinus", areaHa: 4.2 })).toBeNull();
    expect(validateStandDraft({ propertyId: 0, code: "T-01", species: "pinus", areaHa: 4.2 })).toMatch(/Área/i);
    expect(validateStandDraft({ propertyId: 3, code: "", species: "pinus", areaHa: 4.2 })).toMatch(/código/i);
    expect(validateStandDraft({ propertyId: 3, code: "T-01", species: "pinus", areaHa: null })).toMatch(/Desenhe/i);
  });
});

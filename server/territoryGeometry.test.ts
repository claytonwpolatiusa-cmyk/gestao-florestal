import JSZip from "jszip";
import { describe, expect, it, vi } from "vitest";

vi.mock("./storage", () => ({
  storageGetSignedUrl: vi.fn(async () => "https://storage.test/geometry"),
}));
import { ringsFromKml, ringsFromStoredGeometry } from "./territoryGeometry";

describe("geometria territorial no servidor", () => {
  it("lê coordenadas KML no backend", () => {
    expect(ringsFromKml("<kml><coordinates>-51.1,-26.1,0 -51,-26.1,0 -51,-26,0</coordinates></kml>")).toHaveLength(1);
  });

  it("interpreta GeoJSON armazenado sem baixar arquivo", async () => {
    await expect(ringsFromStoredGeometry({ geoJson: JSON.stringify({ type: "Polygon", coordinates: [[[-51.1, -26.1], [-51, -26.1], [-51, -26]]] }) })).resolves.toHaveLength(1);
  });

  it("reconhece KMZ pela assinatura binária do arquivo", async () => {
    const archive = new JSZip();
    archive.file("doc.kml", "<kml><coordinates>-51.1,-26.1,0 -51,-26.1,0 -51,-26,0</coordinates></kml>");
    const buffer = await archive.generateAsync({ type: "arraybuffer" });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(buffer, { status: 200 });
    await expect(ringsFromStoredGeometry({ fileKey: "poligono-opaco", format: "kml" })).resolves.toHaveLength(1);
    globalThis.fetch = originalFetch;
  });
});

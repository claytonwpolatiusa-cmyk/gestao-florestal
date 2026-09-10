import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { polygonRingsFromGeoJson, polygonRingsFromKmz } from "./territoryGeometry";

describe("geometria territorial", () => {
  it("interpreta um polígono GeoJSON", () => {
    const rings = polygonRingsFromGeoJson({ type: "Polygon", coordinates: [[[-51.1, -26.1], [-51, -26.1], [-51, -26], [-51.1, -26.1]]] });
    expect(rings).toEqual([[{ lat: -26.1, lng: -51.1 }, { lat: -26.1, lng: -51 }, { lat: -26, lng: -51 }, { lat: -26.1, lng: -51.1 }]]);
  });

  it("extrai o KML interno de um KMZ e devolve o recorte", async () => {
    const archive = new JSZip();
    archive.file("doc.kml", "<kml><Document><Placemark><Polygon><outerBoundaryIs><LinearRing><coordinates>-51.1,-26.1,0 -51.0,-26.1,0 -51.0,-26.0,0 -51.1,-26.1,0</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></Document></kml>");
    const rings = await polygonRingsFromKmz(await archive.generateAsync({ type: "arraybuffer" }));
    expect(rings).toHaveLength(1);
    expect(rings[0]).toHaveLength(4);
    expect(rings[0][0]).toEqual({ lat: -26.1, lng: -51.1 });
  });
});

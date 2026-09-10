// @vitest-environment jsdom
import * as React from "react";
import { useEffect } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/Map", () => ({
  MapView: ({ onMapError }: { onMapError?: (error: Error) => void }) => {
    useEffect(() => { onMapError?.(new Error("Mapa indisponível")); }, [onMapError]);
    return <div data-testid="mapa-oficial" />;
  },
}));

import { drawnPolygonToGeoJson, polygonAreaHa, SatelliteTerritoryMap } from "./SatelliteTerritoryMap";

afterEach(cleanup);

describe("SatelliteTerritoryMap drawing helpers", () => {
  it("fecha o polígono e o serializa em GeoJSON longitude/latitude", () => {
    const geoJson = JSON.parse(drawnPolygonToGeoJson([{ lat: -26.1, lng: -51.1 }, { lat: -26.1, lng: -51.0 }, { lat: -26.0, lng: -51.0 }]));
    expect(geoJson.type).toBe("Polygon");
    expect(geoJson.coordinates[0][0]).toEqual([-51.1, -26.1]);
    expect(geoJson.coordinates[0].at(-1)).toEqual([-51.1, -26.1]);
  });

  it("calcula uma área positiva em hectares no fallback local", () => {
    expect(polygonAreaHa([{ lat: -26.1, lng: -51.1 }, { lat: -26.1, lng: -51.0 }, { lat: -26.0, lng: -51.0 }])).toBeGreaterThan(0);
  });

  it("permite selecionar um recorte na contingência interativa", async () => {
    const onSelect = vi.fn();
    const { container } = render(<SatelliteTerritoryMap onSelect={onSelect} polygons={[{ id: 5, label: "T-05", species: "pinus", rings: [[{ lat: -26.1, lng: -51.1 }, { lat: -26.1, lng: -51.0 }, { lat: -26.0, lng: -51.0 }]] }]} />);
    expect(await screen.findByText(/Satélite em modo de contingência/i)).toBeTruthy();
    const polygon = container.querySelector("polygon");
    expect(polygon).toBeTruthy();
    fireEvent.click(polygon!);
    expect(onSelect).toHaveBeenCalledWith(5);
  });

  it("permite desenhar três pontos e concluir o polígono na contingência", async () => {
    const onPolygonDrawn = vi.fn();
    const { container } = render(<SatelliteTerritoryMap drawingEnabled onPolygonDrawn={onPolygonDrawn} polygons={[]} />);
    expect(await screen.findByText(/Clique para marcar pontos/i)).toBeTruthy();
    const svg = container.querySelector("svg") as SVGSVGElement;
    Object.defineProperty(svg, "getBoundingClientRect", { value: () => ({ left: 0, top: 0, width: 300, height: 300 }), configurable: true });
    fireEvent.click(svg, { clientX: 90, clientY: 240 });
    fireEvent.click(svg, { clientX: 210, clientY: 240 });
    fireEvent.click(svg, { clientX: 150, clientY: 80 });
    fireEvent.click(screen.getByRole("button", { name: "Concluir" }));
    expect(onPolygonDrawn).toHaveBeenCalledWith(expect.objectContaining({ areaHa: expect.any(Number), geoJson: expect.stringContaining("Polygon") }));
    expect(onPolygonDrawn.mock.calls[0][0].areaHa).toBeGreaterThan(0);
  });
});

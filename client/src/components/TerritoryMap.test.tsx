// @vitest-environment jsdom
import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import TerritoryMap from "./TerritoryMap";

afterEach(cleanup);

const stands = [{
  propertyName: "Fazenda Santa Clara",
  stand: {
    id: 7,
    code: "T-07",
    name: "Pinus norte",
    species: "pinus" as const,
    polygonFileUrl: null,
    polygonUrl: null,
    polygonFormat: "geojson" as const,
    polygonGeoJson: JSON.stringify({ type: "Polygon", coordinates: [[[-51.1, -26.1], [-51.0, -26.1], [-51.0, -26.0], [-51.1, -26.1]]] }),
  },
}];

describe("TerritoryMap", () => {
  it("desenha um recorte GeoJSON, destaca o talhão clicado e restaura a visão geral", async () => {
    const { container } = render(<TerritoryMap stands={stands} />);
    expect(await screen.findByText("1 recorte")).toBeTruthy();
    const polygon = container.querySelector("polygon");
    expect(polygon).toBeTruthy();
    fireEvent.click(polygon!);
    expect(await screen.findByText("Em destaque: T-07 · Fazenda Santa Clara")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Ver tudo" }));
    expect(screen.queryByText("Em destaque: T-07 · Fazenda Santa Clara")).toBeNull();
  });
});

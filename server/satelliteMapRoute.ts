import type { Express } from "express";
import { makeBinaryRequest } from "./_core/map";
import { sdk } from "./_core/sdk";

function finite(value: unknown, min: number, max: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

export function registerSatelliteMapRoute(app: Express) {
  app.get("/api/territory-satellite", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user) { res.status(401).end(); return; }
      const lat = finite(req.query.lat, -34, 6);
      const lng = finite(req.query.lng, -75, -30);
      const zoom = finite(req.query.zoom, 3, 20);
      if (lat === null || lng === null || zoom === null) { res.status(400).json({ error: "Parâmetros de mapa inválidos." }); return; }
      const image = await makeBinaryRequest("/maps/api/staticmap", { center: `${lat},${lng}`, zoom: Math.round(zoom), size: "640x640", scale: 2, maptype: "satellite", format: "png" });
      res.setHeader("Content-Type", image.contentType);
      res.setHeader("Cache-Control", "private, max-age=600");
      res.send(image.data);
    } catch (error) {
      console.error("[TerritorySatellite]", error);
      res.status(502).json({ error: "Não foi possível carregar a imagem de satélite." });
    }
  });
}

import type { Hono } from "npm:hono@4";
import { sqlite } from "https://esm.town/v/std/sqlite";
import { extractToken, getDb, parseUserAgent } from "./config.ts";

export function registerDeviceRoutes(app: Hono) {
  // GET /v1/devices
  app.get("/v1/devices", async (c) => {
    const userId = c.get("userId");
    const token = extractToken(c.req.raw);
    const sql = getDb();

    const existing = await sql`SELECT id FROM connected_devices WHERE token = ${token}`;
    if (existing.length === 0) {
      const userAgent = c.req.header("user-agent") || "";
      const ip = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "Inconnue";
      const { os, device_model, device_version, device_name } = parseUserAgent(userAgent);
      try {
        await sql`
          INSERT INTO connected_devices (user_id, token, os, device_model, device_version, ip_address, device_name)
          VALUES (${userId}::text, ${token}, ${os}, ${device_model}, ${device_version}, ${ip}, ${device_name})
        `;
      } catch (err) {
        console.error("Auto-insert device error:", err);
      }
    } else {
      try {
        await sql`UPDATE connected_devices SET last_active = NOW() WHERE token = ${token}`;
      } catch (err) {}
    }

    const rawDevices = await sql`
      SELECT id, token, os, device_model, device_version, ip_address, device_name, last_active, created_at 
      FROM connected_devices 
      WHERE user_id = ${userId}::text 
      ORDER BY last_active DESC
    `;

    const devices = rawDevices.map((d: any) => ({
      id: d.id,
      os: d.os,
      device_model: d.device_model,
      device_version: d.device_version || "",
      ip_address: d.ip_address,
      device_name: d.device_name,
      last_active: d.last_active,
      created_at: d.created_at,
      is_current: d.token === token,
    }));

    return c.json({ success: true, devices });
  });

  // DELETE /v1/devices/others
  app.delete("/v1/devices/others", async (c) => {
    const userId = c.get("userId");
    const token = extractToken(c.req.raw);
    const sql = getDb();

    const otherDevices = await sql`
      SELECT token FROM connected_devices 
      WHERE user_id = ${userId}::text AND token != ${token}
    `;

    for (const row of otherDevices) {
      if (row.token) {
        try {
          await sqlite.execute({
            args: [row.token],
            sql: "INSERT OR IGNORE INTO token_blacklist (token) VALUES (?)",
          });
        } catch (_e) {}
      }
    }

    await sql`
      DELETE FROM connected_devices 
      WHERE user_id = ${userId}::text AND token != ${token}
    `;

    return c.json({ success: true, message: "Tous les autres appareils ont été déconnectés." });
  });

  // DELETE /v1/devices/all
  app.delete("/v1/devices/all", async (c) => {
    const userId = c.get("userId");
    const sql = getDb();

    const allDevices = await sql`
      SELECT token FROM connected_devices 
      WHERE user_id = ${userId}::text
    `;

    for (const row of allDevices) {
      if (row.token) {
        try {
          await sqlite.execute({
            args: [row.token],
            sql: "INSERT OR IGNORE INTO token_blacklist (token) VALUES (?)",
          });
        } catch (_e) {}
      }
    }

    await sql`
      DELETE FROM connected_devices 
      WHERE user_id = ${userId}::text
    `;

    return c.json({ success: true, message: "Tous les appareils ont été déconnectés." });
  });

  // PUT /v1/devices/:id
  app.put("/v1/devices/:id", async (c) => {
    const userId = c.get("userId");
    const deviceId = c.req.param("id");
    const { device_name } = await c.req.json();
    const sql = getDb();
    await sql`UPDATE connected_devices SET device_name = ${device_name} WHERE id = ${deviceId} AND user_id = ${userId}::text`;
    return c.json({ success: true });
  });

  // DELETE /v1/devices/:id
  app.delete("/v1/devices/:id", async (c) => {
    const userId = c.get("userId");
    const deviceId = c.req.param("id");
    const sql = getDb();
    
    const devices = await sql`SELECT token FROM connected_devices WHERE id = ${deviceId} AND user_id = ${userId}::text LIMIT 1`;
    if (devices.length > 0) {
      const token = devices[0].token;
      if (token) {
        await sqlite.execute({
          args: [token],
          sql: "INSERT OR IGNORE INTO token_blacklist (token) VALUES (?)",
        });
      }
      await sql`DELETE FROM connected_devices WHERE id = ${deviceId}`;
    }
    return c.json({ success: true });
  });
}

"use server";

import { neon } from "@neondatabase/serverless";

export async function getDashboardStats(userId: string) {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("La variable d'environnement DATABASE_URL est manquante.");
    }
    
    const sql = neon(databaseUrl);
    
    // Total des requêtes
    const totalRequestsResult = await sql`
      SELECT COUNT(*) as count 
      FROM mprojects_api_logs l
      JOIN mprojects_api_keys k ON l.api_key = k.api_key
      WHERE k.user_id = ${userId}
    `;
    const totalRequests = parseInt(totalRequestsResult[0].count, 10);

    // Moyenne de latence
    const avgLatencyResult = await sql`
      SELECT AVG(latency_ms) as avg_latency 
      FROM mprojects_api_logs l
      JOIN mprojects_api_keys k ON l.api_key = k.api_key
      WHERE k.user_id = ${userId}
    `;
    const avgLatency = avgLatencyResult[0].avg_latency ? Math.round(parseFloat(avgLatencyResult[0].avg_latency)) : 0;

    // Taux d'erreur
    const errorRequestsResult = await sql`
      SELECT COUNT(*) as error_count 
      FROM mprojects_api_logs l
      JOIN mprojects_api_keys k ON l.api_key = k.api_key
      WHERE k.user_id = ${userId} AND status_code >= 400
    `;
    const errorCount = parseInt(errorRequestsResult[0].error_count, 10);
    const successRate = totalRequests > 0 ? Math.round(((totalRequests - errorCount) / totalRequests) * 100) : 100;

    // Données par route (Endpoints utilisés)
    const endpointsResult = await sql`
      SELECT l.endpoint as name, COUNT(*) as value
      FROM mprojects_api_logs l
      JOIN mprojects_api_keys k ON l.api_key = k.api_key
      WHERE k.user_id = ${userId}
      GROUP BY l.endpoint
      ORDER BY value DESC
    `;
    const endpointsData = endpointsResult.map(r => ({
      name: r.name,
      value: parseInt(r.value, 10),
      color: "#" + Math.floor(Math.random()*16777215).toString(16) // Random color ou attribuer via le frontend
    }));

    // Données sur les 30 derniers jours (graphique principal)
    // Utilisation de generate_series pour avoir des 0 pour les jours sans requêtes
    const monthlyDataResult = await sql`
      WITH date_series AS (
        SELECT generate_series(
          current_date - interval '29 days',
          current_date,
          '1 day'::interval
        )::date AS date
      )
      SELECT 
        to_char(d.date, 'DD/MM') as date_label,
        COALESCE(COUNT(l.id), 0) as requests,
        COALESCE(SUM(CASE WHEN l.status_code >= 400 THEN 1 ELSE 0 END), 0) as errors
      FROM date_series d
      LEFT JOIN (
        SELECT al.id, al.status_code, al.created_at::date as date
        FROM mprojects_api_logs al
        JOIN mprojects_api_keys ak ON al.api_key = ak.api_key
        WHERE ak.user_id = ${userId}
      ) l ON d.date = l.date
      GROUP BY d.date
      ORDER BY d.date ASC
    `;
    const monthlyData = monthlyDataResult.map(r => ({
      date: r.date_label,
      requests: parseInt(r.requests, 10),
      errors: parseInt(r.errors, 10)
    }));

    // Latence sur les 24 dernières heures
    const hourlyLatencyResult = await sql`
      WITH hour_series AS (
        SELECT generate_series(
          date_trunc('hour', current_timestamp - interval '23 hours'),
          date_trunc('hour', current_timestamp),
          '1 hour'::interval
        ) AS hour_ts
      )
      SELECT 
        to_char(h.hour_ts, 'HH24:MI') as time_label,
        COALESCE(AVG(l.latency_ms), 0) as latency
      FROM hour_series h
      LEFT JOIN (
        SELECT al.latency_ms, date_trunc('hour', al.created_at) as hour_ts
        FROM mprojects_api_logs al
        JOIN mprojects_api_keys ak ON al.api_key = ak.api_key
        WHERE ak.user_id = ${userId}
      ) l ON h.hour_ts = l.hour_ts
      GROUP BY h.hour_ts
      ORDER BY h.hour_ts ASC
    `;
    const hourlyData = hourlyLatencyResult.map(r => ({
      time: r.time_label,
      latency: Math.round(parseFloat(r.latency))
    }));

    return {
      success: true,
      stats: {
        totalRequests,
        avgLatency,
        successRate,
        endpointsData,
        monthlyData,
        hourlyData
      }
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return {
      success: false,
      error: "Impossible de récupérer les statistiques."
    };
  }
}

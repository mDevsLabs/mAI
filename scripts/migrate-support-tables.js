import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

function loadEnv() {
  if (!process.env.DATABASE_URL) {
    const envPaths = [".env", ".env.local"];
    for (const envPath of envPaths) {
      const fullPath = path.resolve(process.cwd(), envPath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
            const [key, ...vals] = trimmed.split("=");
            let val = vals.join("=").trim();
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1);
            }
            if (!process.env[key.trim()]) {
              process.env[key.trim()] = val;
            }
          }
        }
      }
    }
  }
}

loadEnv();

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL non trouvée dans l'environnement !");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  console.log("Exécution de la création des tables support...");

  await sql`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_number SERIAL,
      user_id TEXT NOT NULL,
      user_email TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_tier TEXT DEFAULT 'Free',
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      project TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'open',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      resolved_at TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}'::jsonb
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_support_tickets_project ON support_tickets(project);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_number ON support_tickets(ticket_number);`;

  await sql`
    CREATE TABLE IF NOT EXISTS support_ticket_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL,
      sender_email TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL DEFAULT 'user',
      message TEXT NOT NULL,
      action_type TEXT NOT NULL DEFAULT 'message',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_ticket_messages(ticket_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_ticket_messages(created_at ASC);`;

  try {
    await sql`
      CREATE OR REPLACE FUNCTION update_support_ticket_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    await sql`DROP TRIGGER IF EXISTS trigger_update_support_ticket_timestamp ON support_tickets;`;
    await sql`
      CREATE TRIGGER trigger_update_support_ticket_timestamp
      BEFORE UPDATE ON support_tickets
      FOR EACH ROW
      EXECUTE FUNCTION update_support_ticket_updated_at();
    `;
  } catch (e) {
    console.warn("Trigger warning:", e.message);
  }

  console.log("✅ Tables support_tickets et support_ticket_messages créées avec succès !");

  // ── Migration v2 : exécution de support_v2_upgrade.sql si présent ──
  try {
    const v2Path = path.resolve(process.cwd(), "scripts", "support_v2_upgrade.sql");
    if (fs.existsSync(v2Path)) {
      console.log("Exécution de la migration v2 (support_v2_upgrade.sql)...");
      const v2Sql = fs.readFileSync(v2Path, "utf8");

      // Splitter respectant les dollar-quotes $$ pour la fonction plpgsql
      function splitSqlStatements(sqlText) {
        const statements = [];
        let current = "";
        let inDollar = false;
        let i = 0;
        while (i < sqlText.length) {
          if (sqlText.slice(i, i + 2) === "$$") {
            inDollar = !inDollar;
            current += "$$";
            i += 2;
            continue;
          }
          if (!inDollar && sqlText[i] === ";" ) {
            current += ";";
            const trimmed = current.trim();
            // Extraire sans commentaires -- lignes
            const withoutComments = trimmed.split("\n").filter(l => !l.trim().startsWith("--")).join("\n").trim();
            if (withoutComments && withoutComments !== ";") {
              statements.push(withoutComments);
            }
            current = "";
            i++;
            continue;
          }
          current += sqlText[i];
          i++;
        }
        const leftover = current.trim();
        if (leftover) {
          const withoutComments = leftover.split("\n").filter(l => !l.trim().startsWith("--")).join("\n").trim();
          if (withoutComments) statements.push(withoutComments);
        }
        return statements;
      }

      const stmts = splitSqlStatements(v2Sql);
      console.log(`  -> ${stmts.length} statements détectés`);
      for (let idx = 0; idx < stmts.length; idx++) {
        const stmt = stmts[idx].trim();
        if (!stmt) continue;
        // ignorer les commentaires purs
        if (stmt.startsWith("--")) continue;
        try {
          await sql.query(stmt, []);
        } catch (qe) {
          // idempotent : ignorer erreurs "already exists" mais logger autres
          const msg = qe.message || "";
          if (msg.includes("already exists") || msg.includes("does not exist")) {
            console.log(`  (info) statement ${idx + 1}: ${msg.slice(0, 80)}`);
          } else {
            throw qe;
          }
        }
      }
      console.log("✅ Migration v2 appliquée avec succès !");
    }
  } catch (e) {
    console.error("⚠️ Erreur migration v2:", e.message);
  }
}

main().catch((err) => {
  console.error("Erreur migration support:", err);
  process.exit(1);
});

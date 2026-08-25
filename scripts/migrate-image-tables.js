import { neon } from "@neondatabase/serverless";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL non définie dans l'environnement !");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  console.log("Migration des tables d'images en cours...");

  await sql`
    CREATE TABLE IF NOT EXISTS mprojects_daily_image_usage (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
      images_generated INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT unique_user_daily_image UNIQUE (user_id, usage_date)
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_image_usage_user_date 
    ON mprojects_daily_image_usage (user_id, usage_date);
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS mprojects_image_generations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      api_key TEXT,
      model TEXT NOT NULL,
      prompt TEXT NOT NULL,
      negative_prompt TEXT,
      width INTEGER DEFAULT 1024,
      height INTEGER DEFAULT 1024,
      image_url TEXT,
      status TEXT DEFAULT 'completed',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_image_gen_user_created 
    ON mprojects_image_generations (user_id, created_at DESC);
  `;

  console.log("✅ Migration des tables d'images terminée avec succès !");
}

main().catch((err) => {
  console.error("Erreur lors de la migration:", err);
  process.exit(1);
});

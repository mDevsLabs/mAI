import { neon } from '@neondatabase/serverless';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ Erreur : DATABASE_URL n'est pas définie dans le fichier .env");
    process.exit(1);
  }
  
  const sql = neon(url);
  
  console.log("⏳ Réinitialisation des usages API...");
  await sql`UPDATE mprojects_api_keys SET request_count = 0`;
  console.log("✅ Succès : Tous les usages API ont été remis à 0 !");
}

main().catch(err => {
  console.error("❌ Erreur inattendue :", err);
  process.exit(1);
});

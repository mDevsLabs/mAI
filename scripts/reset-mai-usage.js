import { neon } from '@neondatabase/serverless';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ Erreur : DATABASE_URL n'est pas définie dans le fichier .env");
    process.exit(1);
  }
  
  const sql = neon(url);
  
  console.log("⏳ Réinitialisation des usages mAI...");
  await sql`UPDATE weekly_usage SET tokens_used = 0`;
  console.log("✅ Succès : Tous les usages mAI ont été remis à 0 !");
}

main().catch(err => {
  console.error("❌ Erreur inattendue :", err);
  process.exit(1);
});

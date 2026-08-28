import { runSubscriptionCodeManager, initSubscriptionTables, generateRandomCode } from './admin';

export { initSubscriptionTables, generateRandomCode };

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('create-subscription-code.ts')) {
  runSubscriptionCodeManager().catch((err) => {
    console.error("❌ Erreur inattendue :", err);
    process.exit(1);
  });
}

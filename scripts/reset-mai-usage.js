import { resetMaiUsage } from './admin';

resetMaiUsage(true).catch((err) => {
  console.error("❌ Erreur inattendue :", err);
  process.exit(1);
});

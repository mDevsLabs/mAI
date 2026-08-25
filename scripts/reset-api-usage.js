import { resetApiUsage } from './admin';

resetApiUsage(true).catch((err) => {
  console.error("❌ Erreur inattendue :", err);
  process.exit(1);
});

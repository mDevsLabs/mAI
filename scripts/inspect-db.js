/**
 * Affiche toutes les tables de la base Neon
 */
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(join(__dirname, '..', '.env'), 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const eq = line.indexOf('=');
  if (eq < 0 || line.trim().startsWith('#')) continue;
  const key = line.substring(0, eq).trim();
  let val = line.substring(eq + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
  envVars[key] = val;
}

const sql = neon(envVars.DATABASE_URL);

async function run() {
  // Liste complète des tables
  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;

  console.log('\n📊 TABLES EXISTANTES EN BASE NEON:');
  console.log('═'.repeat(50));
  tables.forEach(t => console.log('  •', t.table_name));

  // Vérifier usage_logs
  const usageLogs = tables.find(t => t.table_name === 'usage_logs');
  const weeklyUsage = tables.find(t => t.table_name === 'weekly_usage');

  console.log('\n🔍 VÉRIFICATION DES TABLES DE LOG:');
  console.log('═'.repeat(50));
  console.log(`  usage_logs    : ${usageLogs ? '✅ EXISTE' : '❌ ABSENTE'}`);
  console.log(`  weekly_usage  : ${weeklyUsage ? '✅ EXISTE' : '❌ ABSENTE'}`);

  // Colonnes usage_logs si elle existe
  if (usageLogs) {
    console.log('\n📋 COLONNES DE usage_logs:');
    const cols = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'usage_logs' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    cols.forEach(c => console.log(`    • ${c.column_name.padEnd(25)} ${c.data_type} ${c.is_nullable === 'NO' ? '[NOT NULL]' : ''}`));
  }

  // Colonnes weekly_usage
  if (weeklyUsage) {
    console.log('\n📋 COLONNES DE weekly_usage:');
    const cols = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'weekly_usage' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    cols.forEach(c => console.log(`    • ${c.column_name.padEnd(25)} ${c.data_type} ${c.is_nullable === 'NO' ? '[NOT NULL]' : ''}`));
  }

  // user_settings manquants
  console.log('\n⚙️ COLONNES MANQUANTES DANS user_settings:');
  console.log('═'.repeat(50));
  const settingsCols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'user_settings' AND table_schema = 'public'
  `;
  const existingCols = settingsCols.map(c => c.column_name);
  const expectedCols = [
    'feed_default_mode', 'hide_reposts', 'blocked_keywords',
    'two_factor_auth', 'allow_mentions', 'allow_dms', 'dms_enabled',
    'blur_sensitive_content', 'allow_dms_from'
  ];
  expectedCols.forEach(col => {
    console.log(`  ${col.padEnd(30)} : ${existingCols.includes(col) ? '✅ présent' : '❌ MANQUANT'}`);
  });

  // is_verified dans users et profiles
  console.log('\n🔐 COLONNE is_verified:');
  const usersVer = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='is_verified'`;
  const profilesVer = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_verified'`;
  console.log(`  users.is_verified    : ${usersVer.length ? '✅ présent' : '❌ MANQUANT'}`);
  console.log(`  profiles.is_verified : ${profilesVer.length ? '✅ présent' : '❌ MANQUANT'}`);

  console.log('\n✅ Audit terminé.\n');
}

run().catch(e => { console.error('💥', e.message); process.exit(1); });

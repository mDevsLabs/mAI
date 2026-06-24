#!/usr/bin/env node
import { execSync } from 'child_process';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const keys = {
  ours: '1', theirs: '2', skip: '3', theirsDir: '4', oursDir: '5',
  theirsRoot: '6', oursRoot: '7', theirsAll: '8', oursAll: '9', 
  diff: 'd', edit: 'e', mergetool: 'm', abort: 'a', undo: 'u', quit: 'q'
};

if (args.includes('--help') || args.includes('-h')) {
  console.info(`
🚀 M-AI Merger - Résolution de conflits interactive

Utilisation :
  merger [options]

Options de personnalisation des touches :
  --key-ours <touche>      Garder Actuelle (mAI) (défaut: ${keys.ours})
  --key-theirs <touche>    Garder Entrante (canary) (défaut: ${keys.theirs})
  --key-skip <touche>      Passer (défaut: ${keys.skip})
  --key-tdir <touche>      Entrante pour TOUT le dossier (défaut: ${keys.theirsDir})
  --key-odir <touche>      Actuelle pour TOUT le dossier (défaut: ${keys.oursDir})
  --key-troot <touche>     Entrante pour la racine (défaut: ${keys.theirsRoot})
  --key-oroot <touche>     Actuelle pour la racine (défaut: ${keys.oursRoot})
  --key-tall <touche>      Entrante pour TOUS les fichiers restants (défaut: ${keys.theirsAll})
  --key-oall <touche>      Actuelle pour TOUS les fichiers restants (défaut: ${keys.oursAll})
  --key-diff <touche>      Voir le diff (défaut: ${keys.diff})
  --key-edit <touche>      Ouvrir l'éditeur (défaut: ${keys.edit})
  --key-merge <touche>     Lancer git mergetool (défaut: ${keys.mergetool})
  --key-abort <touche>     Annuler la fusion globale (défaut: ${keys.abort})
  --key-undo <touche>      Annuler la dernière action (défaut: ${keys.undo})
  --key-quit <touche>      Quitter (défaut: ${keys.quit})

Exemple :
  merger --key-ours o --key-theirs t --key-skip s
  `);
  process.exit(0);
}

// Parser les arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--key-ours' && args[i+1]) keys.ours = args[++i];
  if (args[i] === '--key-theirs' && args[i+1]) keys.theirs = args[++i];
  if (args[i] === '--key-skip' && args[i+1]) keys.skip = args[++i];
  if (args[i] === '--key-tdir' && args[i+1]) keys.theirsDir = args[++i];
  if (args[i] === '--key-odir' && args[i+1]) keys.oursDir = args[++i];
  if (args[i] === '--key-troot' && args[i+1]) keys.theirsRoot = args[++i];
  if (args[i] === '--key-oroot' && args[i+1]) keys.oursRoot = args[++i];
  if (args[i] === '--key-tall' && args[i+1]) keys.theirsAll = args[++i];
  if (args[i] === '--key-oall' && args[i+1]) keys.oursAll = args[++i];
  if (args[i] === '--key-diff' && args[i+1]) keys.diff = args[++i];
  if (args[i] === '--key-edit' && args[i+1]) keys.edit = args[++i];
  if (args[i] === '--key-merge' && args[i+1]) keys.mergetool = args[++i];
  if (args[i] === '--key-abort' && args[i+1]) keys.abort = args[++i];
  if (args[i] === '--key-undo' && args[i+1]) keys.undo = args[++i];
  if (args[i] === '--key-quit' && args[i+1]) keys.quit = args[++i];
}

readline.emitKeypressEvents(process.stdin);

const STATE_FILE = path.join('.git', 'resolve_canary_state.json');
const BRANDING_KEYWORDS = ['mAI', 'Aura', 'may.PNG', 'may.png', 'MayAgent'];
const UPSTREAM_URL = 'https://github.com/lobehub/lobe-chat.git';

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch (e) {
    return '';
  }
}

function runCmdInteractive(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    // Ignore error
  }
}

async function askString(promptText, defaultVal) {
  if (process.stdin.isTTY) process.stdin.setRawMode(false);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(`${promptText} [défaut: ${defaultVal}] : `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultVal);
    });
  });
}

async function askKey(promptText, allowedKeys) {
  process.stdout.write(promptText);
  return new Promise(resolve => {
    const onKey = (str, key) => {
      // Annuler avec Echap ou Tab
      if (key && (key.name === 'escape' || key.name === 'tab')) {
        process.stdin.removeListener('keypress', onKey);
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        process.stdout.write('\n❌ Action annulée (Échap/Tab).\n');
        resolve('CANCEL');
        return;
      }

      if (key && key.ctrl && key.name === 'c') {
        process.exit();
      }
      
      const choice = str ? str.toLowerCase() : '';
      if (allowedKeys.includes(choice)) {
        process.stdin.removeListener('keypress', onKey);
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        process.stdout.write(choice + '\n');
        resolve(choice);
      }
    };
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    process.stdin.on('keypress', onKey);
  });
}

function getConflictCount(file) {
  try {
    if (!fs.existsSync(file)) return 0;
    const content = fs.readFileSync(file, 'utf-8');
    const matches = content.match(/^<<<<<<< /gm);
    return matches ? matches.length : 0;
  } catch (e) {
    return 0;
  }
}

function detectsBrandingOverwrite(file) {
  try {
    const oursStr = runCmd(`git show :2:"${file}"`);
    const theirsStr = runCmd(`git show :3:"${file}"`);
    
    const lostKeywords = [];
    for (const kw of BRANDING_KEYWORDS) {
      const inOurs = oursStr.toLowerCase().includes(kw.toLowerCase());
      const inTheirs = theirsStr.toLowerCase().includes(kw.toLowerCase());
      if (inOurs && !inTheirs) {
        lostKeywords.push(kw);
      }
    }
    return lostKeywords;
  } catch (e) {
    return [];
  }
}

function checkUpstreamRemote() {
  const remotes = runCmd('git remote -v');
  if (!remotes.includes('upstream')) {
    console.info(`🌐 Configuration du remote 'upstream' vers ${UPSTREAM_URL}...`);
    runCmd(`git remote add upstream ${UPSTREAM_URL}`);
  }
}

async function handleNoConflicts() {
  console.info('✅ Aucun conflit à résoudre.');
  
  if (fs.existsSync(path.join('.git', 'MERGE_HEAD'))) {
    console.info('\n⚠️ Un merge est en cours mais tous les conflits semblent résolus.');
    const choice = await askKey('Voulez-vous commit la fusion maintenant ? (y/n) : ', ['y', 'n']);
    if (choice === 'y') {
      runCmdInteractive('git commit --no-edit');
      console.info('🎉 Fusion terminée avec succès !');
    }
    return;
  }

  checkUpstreamRemote();
  let menuActive = true;
  while (menuActive) {
    console.info(`\n======================================================`);
    console.info(`🛠️  MENU DE SYNCHRONISATION M-AI`);
    console.info(`======================================================`);
    console.info(`  [1] Pull (fetch + merge) depuis upstream/canary`);
    console.info(`  [2] Pull (fetch + merge) depuis upstream/main`);
    console.info(`  [3] Mettre à jour l'état (Fetch All) & Voir les stats`);
    console.info(`  [4] Nettoyer le cache du projet (node_modules, .next)`);
    console.info(`  [5] Push la branche courante vers origin`);
    console.info(`  [6] Annuler la fusion en cours (git merge --abort)`);
    console.info(`  [q] Quitter le script`);
    
    const choice = await askKey('\n👉 Votre choix : ', ['1', '2', '3', '4', '5', '6', 'q']);
    if (choice === 'CANCEL') continue;
    
    switch (choice) {
      case '1':
      case '2': {
        const branch = choice === '1' ? 'canary' : 'main';
        const pullArgs = await askString(`\n⚙️ Arguments pour 'git pull upstream ${branch}'`, '--no-commit');
        console.info(`\n📥 Pull depuis upstream ${branch} avec: ${pullArgs}`);
        runCmdInteractive(`git pull upstream ${branch} ${pullArgs}`);
        menuActive = false;
        main(); 
        break;
      }
      case '3':
        console.info('\n🔄 Fetch de tous les remotes...');
        runCmdInteractive('git fetch --all');
        console.info('\n📊 Statut Git :');
        runCmdInteractive('git status -sb');
        break;
      case '4': {
        const confirm = await askKey('\n⚠️ Voulez-vous supprimer "node_modules", ".next" et nettoyer le cache pnpm ? (y/n) : ', ['y', 'n']);
        if (confirm === 'y') {
          console.info('\n🧹 Nettoyage en cours...');
          try { fs.rmSync('node_modules', { recursive: true, force: true }); } catch (e) {}
          try { fs.rmSync('.next', { recursive: true, force: true }); } catch (e) {}
          runCmdInteractive('pnpm store prune');
          console.info('✅ Nettoyage terminé.');
        }
        break;
      }
      case '5':
        console.info('\n📤 Push vers origin...');
        runCmdInteractive('git push origin HEAD');
        break;
      case '6':
        console.info('\n🛑 Annulation du merge...');
        runCmdInteractive('git merge --abort');
        console.info('✅ Merge annulé.');
        break;
      case 'q':
        console.info('👋 À bientôt !');
        menuActive = false;
        break;
    }
  }
}

async function main() {
  console.info('\n🔍 Analyse de l\'état du dépôt Git...');
  
  const statusOutput = runCmd('git status --porcelain');
  
  const lines = statusOutput.split('\n');
  const unmergedFiles = [];
  
  for (const line of lines) {
    if (!line.trim()) continue;
    const status = line.substring(0, 2);
    const file = line.substring(3).trim();
    if (['DD', 'AU', 'UD', 'UA', 'DU', 'AA', 'UU'].includes(status)) {
      unmergedFiles.push({ status, file });
    }
  }

  if (unmergedFiles.length === 0) {
    await handleNoConflicts();
    return;
  }

  let autoDecisions = {};
  let startIndex = 0;
  let history = []; 
  let stats = { ours: 0, theirs: 0, auto: 0, skipped: 0 };

  if (fs.existsSync(STATE_FILE)) {
    try {
      const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
      const resume = await askKey(`💾 Un état précédent a été trouvé. Reprendre à l'étape ${state.index + 1} ? (y/n) : `, ['y', 'n']);
      if (resume === 'CANCEL') {
        console.info('Action annulée. Redémarrage du menu.');
        return main();
      }
      if (resume === 'y') {
        autoDecisions = state.autoDecisions || {};
        startIndex = state.index || 0;
        history = state.history || [];
        stats = state.stats || stats;
        console.info(`✨ Reprise depuis le fichier ${startIndex + 1}.`);
      } else {
        console.info('🗑️  Nouvelle session démarrée.');
      }
    } catch (e) {
      console.info('⚠️ Impossible de charger l\'état précédent.');
    }
  }

  console.info(`⚠️ ${unmergedFiles.length} fichier(s) en conflit trouvé(s).\n`);

  let i = startIndex;
  while (i < unmergedFiles.length) {
    fs.writeFileSync(STATE_FILE, JSON.stringify({ index: i, autoDecisions, history, stats }, null, 2));

    const { status, file } = unmergedFiles[i];
    const conflictCount = getConflictCount(file);

    console.info(`\n======================================================`);
    console.info(`📄 Fichier ${i + 1} sur ${unmergedFiles.length} : \x1b[36m${file}\x1b[0m`);
    console.info(`   Statut Git : ${status} | Marqueurs de conflit : ${conflictCount}`);
    console.info(`   Stats : mAI (${stats.ours}) | Canary (${stats.theirs}) | Auto (${stats.auto})`);
    console.info(`======================================================`);

    const upstreamFolders = [
      '.agents', '.codex', '.claude', '.conductor', '.cursor',
      '.devcontainer', '.githooks', '.vscode', 'docker-compose',
      'locales', 'packages', 'patches'
    ];
    if (upstreamFolders.some(folder => file.startsWith(folder + '/') || file === folder)) {
      console.info(`📥 Règle automatique : Conservation de la version entrante (theirs) pour ${file}`);
      runCmd(`git checkout --theirs "${file}"`);
      runCmd(`git add "${file}"`);
      stats.auto++;
      i++;
      continue;
    }

    if (file.startsWith('docs/')) {
      console.info('🗑️  Règle automatique : Suppression du dossier docs/');
      runCmd(`git rm -f "${file}"`);
      stats.auto++;
      i++;
      continue;
    }

    if (file === 'CHANGELOG.md') {
      console.info('🛡️  Règle automatique : Conservation de CHANGELOG.md');
      runCmd(`git checkout --ours "${file}"`);
      runCmd(`git add "${file}"`);
      stats.auto++;
      i++;
      continue;
    }

    if (file.endsWith('package.json')) {
      console.info('📦 Règle automatique : Fusion intelligente de package.json');
      try {
        const oursStr = runCmd(`git show :2:"${file}"`);
        const theirsStr = runCmd(`git show :3:"${file}"`);
        if (oursStr && theirsStr) {
          const oursJson = JSON.parse(oursStr);
          const theirsJson = JSON.parse(theirsStr);
          oursJson.dependencies = theirsJson.dependencies || oursJson.dependencies;
          oursJson.devDependencies = theirsJson.devDependencies || oursJson.devDependencies;
          oursJson.peerDependencies = theirsJson.peerDependencies || oursJson.peerDependencies;
          fs.writeFileSync(file, JSON.stringify(oursJson, null, 2) + '\n', 'utf-8');
          runCmd(`git add "${file}"`);
          console.info('✅ Fusion réussie pour ' + file);
          stats.auto++;
          i++;
          continue;
        }
      } catch (e) {
        console.info('❌ Erreur de fusion auto de package.json, passage manuel.');
      }
    }

    if (status === 'UD') {
      console.info('♻️  Règle automatique : Conservé (Modifié par canary, supprimé par nous)');
      runCmd(`git checkout --theirs "${file}"`);
      runCmd(`git add "${file}"`);
      stats.auto++;
      i++;
      continue;
    } else if (status === 'DU') {
      console.info('♻️  Règle automatique : Conservé (Modifié par nous, supprimé par canary)');
      runCmd(`git checkout --ours "${file}"`);
      runCmd(`git add "${file}"`);
      stats.auto++;
      i++;
      continue;
    }

    let autoDecision = null;
    let matchedDir = '';
    
    if (autoDecisions['ALL']) {
      autoDecision = autoDecisions['ALL'];
      matchedDir = 'GLOBAL';
    } else {
      for (const dir of Object.keys(autoDecisions)) {
        if (dir !== 'ALL' && file.startsWith(dir)) {
          autoDecision = autoDecisions[dir];
          matchedDir = dir;
          break;
        }
      }
    }

    if (autoDecision === 'ours') {
      console.info(`✅ Règle auto (${matchedDir}) : Version actuelle (mAI) conservée.`);
      runCmd(`git checkout --ours "${file}"`);
      runCmd(`git add "${file}"`);
      stats.auto++;
      i++;
      continue;
    } else if (autoDecision === 'theirs') {
      const lostBranding = detectsBrandingOverwrite(file);
      if (lostBranding.length > 0) {
        console.info(`\n⚠️  \x1b[33mATTENTION (Règle automatique ${matchedDir}) : Ce fichier contient du branding mAI qui risque d'être écrasé !\x1b[0m`);
        console.info(`   Mots clés détectés en local mais absents de Canary : ${lostBranding.join(', ')}`);
        const confirm = await askKey('❓ Voulez-vous VRAIMENT écraser avec la version Canary pour CE fichier ? (y/n) : ', ['y', 'n']);
        if (confirm !== 'y') {
          console.info('Décision automatique ignorée pour ce fichier, retour au mode manuel.');
          autoDecision = null; // Annule la décision auto pour ce fichier, il passe au prompt manuel
        }
      }
      
      if (autoDecision === 'theirs') {
        console.info(`✅ Règle auto (${matchedDir}) : Version entrante (canary) conservée.`);
        runCmd(`git checkout --theirs "${file}"`);
        runCmd(`git add "${file}"`);
        stats.auto++;
        i++;
        continue;
      }
    }

    const lastSlash = file.lastIndexOf('/');
    const dir = lastSlash >= 0 ? file.substring(0, lastSlash + 1) : null;
    const firstSlash = file.indexOf('/');
    const topDir = firstSlash >= 0 ? file.substring(0, firstSlash + 1) : null;

    let validChoice = false;
    while (!validChoice) {
      console.info(`\nMenu d'options :`);
      console.info(`  [${keys.ours}] Garder Actuelle (mAI)`);
      console.info(`  [${keys.theirs}] Garder Entrante (canary)`);
      console.info(`  [${keys.skip}] Passer / Laisser les marqueurs`);
      if (dir) {
        console.info(`  [${keys.theirsDir}] Garder Entrante (canary) pour TOUT le dossier (${dir})`);
        console.info(`  [${keys.oursDir}] Garder Actuelle (mAI) pour TOUT le dossier (${dir})`);
      }
      if (topDir && topDir !== dir) {
        console.info(`  [${keys.theirsRoot}] Garder Entrante (canary) pour le dossier RACINE (${topDir})`);
        console.info(`  [${keys.oursRoot}] Garder Actuelle (mAI) pour le dossier RACINE (${topDir})`);
      }
      console.info(`  [${keys.theirsAll}] Garder Entrante (canary) pour TOUS les fichiers restants (Global)`);
      console.info(`  [${keys.oursAll}] Garder Actuelle (mAI) pour TOUS les fichiers restants (Global)`);
      console.info(`  [${keys.diff}] Voir le diff coloré`);
      console.info(`  [${keys.edit}] Ouvrir dans l'éditeur (VS Code/Cursor)`);
      console.info(`  [${keys.mergetool}] Lancer l'outil de fusion Git (mergetool)`);
      console.info(`  [${keys.abort}] Annuler TOTALEMENT la fusion (git merge --abort)`);
      if (history.length > 0) {
        console.info(`  [${keys.undo}] Annuler la dernière action (Undo)`);
      }
      console.info(`  [${keys.quit}] Quitter et sauvegarder l'état`);
      console.info(`  (Echap/Tab pour annuler un prompt en cours)`);

      const allowedOptions = [
        keys.ours, keys.theirs, keys.skip, keys.theirsDir, keys.oursDir,
        keys.theirsRoot, keys.oursRoot, keys.theirsAll, keys.oursAll,
        keys.diff, keys.edit, keys.mergetool, keys.abort, keys.quit
      ];
      if (history.length > 0) allowedOptions.push(keys.undo);
      
      const choice = await askKey('👉 Votre choix : ', allowedOptions);

      if (choice === 'CANCEL') {
        continue;
      }

      if (choice === keys.quit) {
        console.info('\n👋 État sauvegardé. À bientôt !');
        process.exit(0);
      }

      if (choice === keys.abort) {
        const confirm = await askKey('\n⚠️ Voulez-vous vraiment ANNULER totalement la fusion en cours ? (y/n) : ', ['y', 'n']);
        if (confirm === 'CANCEL' || confirm === 'n') continue;
        if (confirm === 'y') {
          runCmdInteractive('git merge --abort');
          if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE);
          console.info('✅ Fusion annulée et état réinitialisé.');
          process.exit(0);
        }
        continue;
      }

      if (choice === keys.undo) {
        const lastAction = history.pop();
        console.info(`\n⏪ Annulation de l'action sur : ${lastAction.file}`);
        runCmd(`git checkout -m -- "${lastAction.file}"`);
        if (lastAction.autoDecisionAdded) delete autoDecisions[lastAction.autoDecisionAdded];
        if (lastAction.decision === 'ours') stats.ours--;
        if (lastAction.decision === 'theirs') stats.theirs--;
        if (lastAction.decision === 'skipped') stats.skipped--;
        i = lastAction.index;
        validChoice = true;
        continue;
      }

      if (choice === keys.diff) {
        console.info('\n--- DEBUT DU DIFF ---');
        runCmdInteractive(`git diff --color -U2 "${file}"`);
        console.info('--- FIN DU DIFF ---\n');
        continue;
      }

      if (choice === keys.edit) {
        console.info(`\n🖥️ Ouverture de ${file} dans l'éditeur...`);
        runCmdInteractive(`code "${file}" || cursor "${file}"`);
        const confirmEdit = await askKey('Appuyez sur "c" pour continuer après avoir sauvegardé vos modifications (ou Echap pour revenir)...', ['c']);
        if (confirmEdit === 'CANCEL') continue;
        continue;
      }

      if (choice === keys.mergetool) {
        console.info(`\n🛠️ Lancement de git mergetool sur ${file}...`);
        runCmdInteractive(`git mergetool "${file}"`);
        validChoice = true;
        i++;
        continue;
      }

      if ([keys.theirs, keys.theirsDir, keys.theirsRoot, keys.theirsAll].includes(choice)) {
        const lostBranding = detectsBrandingOverwrite(file);
        if (lostBranding.length > 0) {
          console.info(`\n⚠️  \x1b[33mATTENTION : Ce fichier contient du branding mAI qui risque d'être écrasé !\x1b[0m`);
          console.info(`   Mots clés détectés en local mais absents de Canary : ${lostBranding.join(', ')}`);
          const confirm = await askKey('❓ Voulez-vous vraiment écraser avec la version Canary ? (y/n) : ', ['y', 'n']);
          if (confirm === 'CANCEL' || confirm !== 'y') {
            console.info('Décision annulée.');
            continue;
          }
        }
      }

      let decision = '';
      let autoDecisionAdded = null;

      if (choice === keys.ours) {
          console.info('\n✅ Version actuelle (mAI) conservée.');
          runCmd(`git checkout --ours "${file}"`);
          runCmd(`git add "${file}"`);
          stats.ours++;
          decision = 'ours';
      } else if (choice === keys.theirs) {
          console.info('\n✅ Version entrante (canary) conservée.');
          runCmd(`git checkout --theirs "${file}"`);
          runCmd(`git add "${file}"`);
          stats.theirs++;
          decision = 'theirs';
      } else if (choice === keys.skip) {
          console.info('\n⏭️  Fichier passé (laissé avec les marqueurs).');
          stats.skipped++;
          decision = 'skipped';
      } else if (choice === keys.theirsDir) {
          if (dir) {
            autoDecisions[dir] = 'theirs';
            autoDecisionAdded = dir;
            console.info(`\n✅ Version entrante (canary) sélectionnée pour tout le dossier ${dir}*`);
          }
          runCmd(`git checkout --theirs "${file}"`);
          runCmd(`git add "${file}"`);
          stats.theirs++;
          decision = 'theirs';
      } else if (choice === keys.oursDir) {
          if (dir) {
            autoDecisions[dir] = 'ours';
            autoDecisionAdded = dir;
            console.info(`\n✅ Version actuelle (mAI) sélectionnée pour tout le dossier ${dir}*`);
          }
          runCmd(`git checkout --ours "${file}"`);
          runCmd(`git add "${file}"`);
          stats.ours++;
          decision = 'ours';
      } else if (choice === keys.theirsRoot) {
          if (topDir) {
            autoDecisions[topDir] = 'theirs';
            autoDecisionAdded = topDir;
            console.info(`\n✅ Version entrante (canary) sélectionnée pour toute la racine ${topDir}*`);
          }
          runCmd(`git checkout --theirs "${file}"`);
          runCmd(`git add "${file}"`);
          stats.theirs++;
          decision = 'theirs';
      } else if (choice === keys.oursRoot) {
          if (topDir) {
            autoDecisions[topDir] = 'ours';
            autoDecisionAdded = topDir;
            console.info(`\n✅ Version actuelle (mAI) sélectionnée pour toute la racine ${topDir}*`);
          }
          runCmd(`git checkout --ours "${file}"`);
          runCmd(`git add "${file}"`);
          stats.ours++;
          decision = 'ours';
      } else if (choice === keys.theirsAll) {
          autoDecisions['ALL'] = 'theirs';
          autoDecisionAdded = 'ALL';
          console.info(`\n✅ Version entrante (canary) sélectionnée pour TOUS les fichiers restants (Global)*`);
          runCmd(`git checkout --theirs "${file}"`);
          runCmd(`git add "${file}"`);
          stats.theirs++;
          decision = 'theirs';
      } else if (choice === keys.oursAll) {
          autoDecisions['ALL'] = 'ours';
          autoDecisionAdded = 'ALL';
          console.info(`\n✅ Version actuelle (mAI) sélectionnée pour TOUS les fichiers restants (Global)*`);
          runCmd(`git checkout --ours "${file}"`);
          runCmd(`git add "${file}"`);
          stats.ours++;
          decision = 'ours';
      }

      history.push({ file, index: i, decision, autoDecisionAdded });
      validChoice = true;
      i++;
    }
  }

  if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE);

  console.info('\n🎉 Résolution des conflits terminée !');
  const confirmCommit = await askKey('Voulez-vous commit la fusion maintenant ? (y/n) : ', ['y', 'n']);
  if (confirmCommit === 'y') {
    runCmdInteractive('git commit --no-edit');
    console.info('✅ Commit de fusion effectué !');
    console.info('✅ Commit de fusion effectué !');
  } else {
    console.info('Vérifiez le statut avec `git status`. N\'oubliez pas de commiter !');
  }
}

main().catch(console.error);

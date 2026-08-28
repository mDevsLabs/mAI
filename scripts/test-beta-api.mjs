import crypto from "node:crypto";

const API_BASE = "https://mdevslabs--01a039924d3771569d4cc6b63181d1f4.web.val.run";
const JWT_SECRET = process.env.MAI_JWT_SECRET || "4a8f9c2d1e3b5a7f9e0c2b4d6a8f1c3e5b7a9f0e2d4c6b8a1f3e5d7c9b0a2f4e";

function base64Url(str) {
  return Buffer.from(str).toString("base64url");
}

function generateTestToken(userId, tier) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId,
    tier: tier || "Free",
    iat: now,
    exp: now + 7200,
  };

  const headerB64 = base64Url(JSON.stringify(header));
  const payloadB64 = base64Url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");

  return `${headerB64}.${payloadB64}.${signature}`;
}

async function runTests() {
  console.log("==================================================================");
  console.log("🧪 DÉMARRAGE DE LA SUITE DE TESTS SUR L'API BETA VAL TOWN");
  console.log(`🌐 Endpoint : ${API_BASE}`);
  console.log("==================================================================\n");

  // ---------------------------------------------------------------------------
  // TEST 1 : Vérification du blocage Image Generation pour le Tier Free
  // ---------------------------------------------------------------------------
  console.log("🔹 TEST 1 : Blocage des requêtes API de génération d'images (Tier Free)");
  const freeToken = generateTestToken("test-free-user-id", "Free");

  const freeImgRes = await fetch(`${API_BASE}/v1/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${freeToken}`,
    },
    body: JSON.stringify({
      prompt: "A beautiful sunset over the mountains",
      model: "black-forest-labs/flux-1-schnell",
    }),
  });

  const freeImgJson = await freeImgRes.json().catch(() => ({}));
  console.log(`- Statut HTTP : ${freeImgRes.status} (Attendu: 403 Forbidden)`);
  console.log(`- Réponse JSON :`, JSON.stringify(freeImgJson, null, 2));

  if (freeImgRes.status === 403) {
    console.log("✅ TEST 1 VALIDÉ : Les utilisateurs Free sont bien bloqués en 403 avec le message approprié !\n");
  } else {
    console.log("❌ TEST 1 ÉCHOUÉ : Statut inattendu\n");
  }

  // ---------------------------------------------------------------------------
  // TEST 2 : Consultation du stockage Cloud (/cloud/storage)
  // ---------------------------------------------------------------------------
  console.log("🔹 TEST 2 : Récupération du statut de stockage (/cloud/storage)");
  const plusToken = generateTestToken("test-storage-user-1", "Plus");

  const storageRes = await fetch(`${API_BASE}/cloud/storage`, {
    headers: {
      "Authorization": `Bearer ${plusToken}`,
    },
  });
  const storageJson = await storageRes.json().catch(() => ({}));
  console.log(`- Statut HTTP : ${storageRes.status}`);
  console.log(`- Réponse Stockage :`, JSON.stringify(storageJson, null, 2));

  if (storageRes.ok) {
    console.log("✅ TEST 2 VALIDÉ : Endpoint /cloud/storage fonctionnel !\n");
  } else {
    console.log("⚠️ TEST 2 : Réponse", storageJson);
  }

  // ---------------------------------------------------------------------------
  // TEST 3 : Upload de 5 fichiers de test (Distribution Multi-Buckets)
  // ---------------------------------------------------------------------------
  console.log("🔹 TEST 3 : Upload et répartition multi-buckets sur Z1 Storage");
  const uploadedFiles = [];

  for (let i = 1; i <= 5; i++) {
    const userTestId = `test-user-node-${i}-${Date.now()}`;
    const userToken = generateTestToken(userTestId, "Plus");

    const formData = new FormData();
    const testContent = `Contenu du fichier de test #${i}\nHorodatage : ${new Date().toISOString()}\nValidation pool multi-buckets Z1 Storage.`;
    const blob = new Blob([testContent], { type: "text/plain" });
    formData.append("file", blob, `test_file_${i}.txt`);

    console.log(`\n📤 [Upload #${i}] Utilisateur : ${userTestId}`);
    const uploadRes = await fetch(`${API_BASE}/cloud/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${userToken}`,
      },
      body: formData,
    });

    const uploadJson = await uploadRes.json().catch(() => ({}));
    console.log(`- Statut HTTP : ${uploadRes.status}`);
    console.log(`- Résultat :`, JSON.stringify(uploadJson, null, 2));

    if (uploadRes.ok && uploadJson.file?.url) {
      uploadedFiles.push({
        id: uploadJson.file.id,
        url: uploadJson.file.url,
        userId: userTestId,
        token: userToken,
      });

      // Test de lecture publique HTTP GET sur l'URL Z1 Storage
      console.log(`🔍 Vérification accessibilité URL publique : ${uploadJson.file.url}`);
      try {
        const publicGetRes = await fetch(uploadJson.file.url);
        console.log(`- Statut HTTP GET : ${publicGetRes.status}`);
        if (publicGetRes.ok) {
          const text = await publicGetRes.text();
          console.log(`- Contenu lu depuis Z1 : "${text.slice(0, 45)}..."`);
          console.log(`✅ Fichier #${i} accessible publiquement avec succès ! 🎉`);
        } else {
          console.log(`⚠️ Statut public ${publicGetRes.status} (Vérifiez les permissions Public Read si 403).`);
        }
      } catch (err) {
        console.log(`⚠️ Erreur fetch URL publique : ${err.message}`);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // TEST 4 : Nettoyage / Suppression d'un fichier (/cloud/files/:id)
  // ---------------------------------------------------------------------------
  if (uploadedFiles.length > 0) {
    console.log("\n🔹 TEST 4 : Suppression d'un fichier de test (/cloud/files/:id)");
    const fileToDelete = uploadedFiles[0];
    const delRes = await fetch(`${API_BASE}/cloud/files/${fileToDelete.id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${fileToDelete.token}`,
      },
    });
    const delJson = await delRes.json().catch(() => ({}));
    console.log(`- Statut HTTP : ${delRes.status}`);
    console.log(`- Résultat suppression :`, JSON.stringify(delJson, null, 2));
    if (delRes.ok && delJson.success) {
      console.log("✅ TEST 4 VALIDÉ : Fichier supprimé avec succès de la DB et de Z1 Storage !");
    }
  }

  console.log("\n==================================================================");
  console.log("🏁 BILAN GLOBAL DES TESTS TERMINÉ");
  console.log("==================================================================");
}

runTests().catch(console.error);

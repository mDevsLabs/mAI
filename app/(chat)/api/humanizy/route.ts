/**
 * API Route pour Humanizy (Détection IA)
 * 
 * @version 0.0.5
 */
import { auth } from "@/app/(auth)/auth";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { text, filename } = await request.json();

    // Simulation d'analyse (À remplacer par un vrai service comme GPTZero ou Copyleaks)
    let score = 12;
    let label = "Probablement humain";
    let details = "Ce texte présente des caractéristiques typiques d'une écriture humaine. La structure des phrases est variée et le vocabulaire est naturel.";

    if (text) {
      // Algo de simulation basé sur la longueur pour avoir des résultats variés
      const length = text.length;
      score = Math.min(Math.floor((length % 100)), 100);
      
      if (score > 70) {
        label = "Probablement généré par IA";
        details = "Ce texte présente une régularité et une structure souvent associées aux contenus générés par des modèles de langage. La faible variance de perplexité suggère une origine artificielle.";
      } else if (score > 30) {
        label = "Contenu mixte ou incertain";
        details = "Le texte contient des éléments pouvant indiquer une édition par IA ou un mélange de sources. Une analyse approfondie est recommandée.";
      }
    } else if (filename) {
      score = 45;
      label = "Contenu mixte ou incertain";
      details = "L'analyse du fichier suggère un contenu potentiellement hybride. Certains passages semblent très fluides tandis que d'autres sont plus mécaniques.";
    }

    return Response.json({ score, label, details });
  } catch (error) {
    console.error("Erreur API Humanizy:", error);
    return Response.json(
      { error: "Erreur lors de l'analyse" },
      { status: 500 }
    );
  }
}

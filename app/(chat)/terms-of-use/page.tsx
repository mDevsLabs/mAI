/**
 * Page des Conditions d'Utilisation de mAI
 * 
 * @version 0.0.6
 */
"use client";

export default function TermsOfUsePage() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full overflow-auto text-foreground">
      <h1 className="text-3xl font-bold mb-4">Conditions d'Utilisation</h1>
      
      <div className="space-y-6 bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)]">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Acceptation et champ d'application</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            En utilisant mAI, vous acceptez les présentes conditions. Elles s'appliquent à l'ensemble des fonctionnalités : chat, studio, bibliothèque, projets, extensions, plugins, et services associés.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Si vous n'acceptez pas ces conditions, vous devez cesser l'utilisation du service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Compte utilisateur</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vous êtes responsable de la confidentialité de vos identifiants, des actions réalisées depuis votre compte et du respect des bonnes pratiques de sécurité (mot de passe fort, verrouillage, vérification des appareils utilisés).
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Vous vous engagez à fournir des informations exactes et à ne pas usurper l'identité d'un tiers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Usages autorisés et interdits</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            L'usage doit rester légal, loyal et non abusif. Sont interdits : contournement des limites, scraping agressif, fraude, compromission, génération de contenu illicite, harcèlement, ou utilisation visant à nuire à des tiers.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            En cas d'usage suspect ou dangereux, des restrictions temporaires ou définitives peuvent être appliquées.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Contenus générés par l'IA</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Les résultats générés peuvent être incomplets, inexacts ou non adaptés à votre contexte. Vous restez seul responsable de la vérification, de la conformité réglementaire et de l'usage final des contenus.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Le service ne constitue pas un conseil juridique, médical, financier ou professionnel.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Disponibilité et évolution du service</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nous pouvons modifier, suspendre ou améliorer des fonctionnalités pour des raisons techniques, de sécurité, de conformité ou de performance. Nous faisons notre possible pour limiter les interruptions.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Certaines fonctions peuvent être proposées en bêta et évoluer sans préavis.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Propriété intellectuelle</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Les éléments de la plateforme (marques, interface, composants propriétaires, charte visuelle) sont protégés. Toute reproduction, extraction substantielle ou exploitation non autorisée est interdite.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Vous conservez vos droits sur vos contenus, sous réserve des licences nécessaires au fonctionnement du service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Limitation de responsabilité</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Le service est fourni « en l'état ». Dans les limites permises par la loi, mAI ne saurait être tenu responsable des dommages indirects, pertes d'opportunité, indisponibilités temporaires ou pertes de données.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Vous êtes responsable de la sauvegarde de vos contenus critiques avant export, publication ou suppression.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Résiliation et suppression</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vous pouvez cesser d'utiliser le service à tout moment. En cas d'abuse grave, de non-respect répété des règles ou de risque de sécurité, l'accès peut être restreint, suspendu ou résilié.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. Tarification et quotas</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Certains modèles et fonctionnalités sont soumis à des quotas, limites d'usage ou plans payants. Les quotas peuvent être réinitialisés selon une périodicité définie par le plan actif.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">10. Droit applicable et litiges</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Les présentes conditions sont régies par le droit applicable dans votre juridiction. En cas de litige, une résolution amiable est privilégiée avant toute procédure contentieuse.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">11. Mise à jour des conditions</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Les conditions d'utilisation peuvent être modifiées pour tenir compte des évolutions techniques, légales et du service. La date de dernière mise à jour fait foi.
          </p>
        </section>
      </div>
    </div>
  );
}

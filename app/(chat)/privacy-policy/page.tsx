/**
 * Page de Politique de Confidentialité de mAI
 * 
 * @version 0.0.6
 */
"use client";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full overflow-auto text-foreground">
      <h1 className="text-3xl font-bold mb-4">Politique de Confidentialité</h1>
      
      <div className="space-y-6 bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)]">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Données collectées</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nous collectons les données strictement nécessaires au fonctionnement du service : informations de compte (ex. email), préférences d'interface, paramètres de personnalisation IA, historiques de conversation et métadonnées techniques minimales (horodatage, identifiant session, diagnostics d'erreur).
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Certaines fonctionnalités (voix, plugins, outils externes, partage) peuvent générer des données supplémentaires propres à leur usage. Ces données restent limitées à la finalité de la fonctionnalité activée.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Finalités de traitement</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Les traitements servent à : (a) fournir et maintenir le service, (b) sécuriser la plateforme et prévenir les abus, (c) personnaliser l'expérience, (d) mesurer la qualité et la performance, (e) respecter nos obligations légales.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Lorsque vous activez des options facultatives, les données associées peuvent être utilisées pour améliorer l'expérience utilisateur (ex. préférences, contexte personnel, réglages de réflexion/modèle).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Base légale et consentement</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Selon votre juridiction, le traitement repose sur l'exécution du contrat de service, notre intérêt légitime (sécurité, stabilité, support), et/ou votre consentement explicite pour les finalités optionnelles.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Vous pouvez retirer votre consentement aux fonctionnalités non essentielles à tout moment depuis les paramètres, sans impact sur les fonctions strictement nécessaires au service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Option “Améliorer mAI pour tous”</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Cette option est désactivée par défaut. Lorsqu'elle est activée, vous autorisez l'utilisation de certains contenus pour améliorer les modèles et la qualité globale. Des mesures de minimisation et de protection de la vie privée sont appliquées.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Si cette option est désactivée, vos contenus ne sont pas utilisés pour l'amélioration générale, hors obligations légales ou besoins stricts de sécurité/anti-abus.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Conservation et suppression</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Les données sont conservées pendant une durée proportionnée à leur finalité. Elles sont ensuite supprimées, agrégées ou anonymisées selon les contraintes légales, de sécurité et de traçabilité.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Les conversations, préférences et historiques locaux peuvent aussi être stockés côté navigateur (localStorage) selon les modules activés.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Partage et sous-traitance</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nous pouvons recourir à des prestataires pour l'hébergement, la sécurité, la notification, le traitement IA ou des outils externes. Ces sous-traitants sont encadrés par des obligations contractuelles de confidentialité et de sécurité.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Nous ne vendons pas vos données personnelles. Les transferts hors de votre pays sont encadrés par des mécanismes juridiques appropriés, lorsque requis.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Vos droits</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vous pouvez demander l'accès, la rectification, l'effacement, l'export, la limitation ou l'opposition, conformément à la réglementation applicable.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Pour exercer vos droits, utilisez les fonctionnalités d'export et de gestion disponibles dans l'application, puis contactez le support si besoin d'une assistance complémentaire.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Sécurité</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nous mettons en place des mesures techniques et organisationnelles raisonnables : contrôle d'accès, surveillance des abus, journalisation de sécurité, et protections applicatives.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Aucune méthode n'étant infaillible, vous restez responsable des informations sensibles partagées volontairement dans vos messages.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. Mineurs et contrôle parental</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Des paramètres de contrôle parental sont disponibles pour limiter l'usage et certaines extensions. Les parents/tuteurs restent responsables de l'encadrement des mineurs.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">10. Mise à jour de la politique</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Cette politique peut évoluer pour refléter des changements réglementaires, techniques ou fonctionnels. La date de dernière mise à jour est indiquée en haut de page.
          </p>
        </section>
      </div>
    </div>
  );
}

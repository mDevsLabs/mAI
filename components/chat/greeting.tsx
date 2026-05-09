/**
 * Composant de greeting pour la page d'accueil de mAI
 * Affiche le logo étoile animé, un titre et un sous-titre en français
 * 
 * @version 0.0.2
 */
import { motion } from "framer-motion";

export const Greeting = () => {
  return (
    <div className="flex flex-col items-center px-4" key="overview">
      {/* Logo étoile animé */}
      <motion.div
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        className="mb-4"
        initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          alt="mAI"
          className="size-12 drop-shadow-lg"
          src="/logo.png"
        />
      </motion.div>

      {/* Titre principal */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-center font-semibold text-2xl tracking-tight text-foreground md:text-3xl"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        Bonjour. comment puis-je vous aider aujourd&apos;hui ?
      </motion.div>

      {/* Sous-titre */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 text-center text-muted-foreground/80 text-sm"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        Avec mAI, passez à la vitesse supérieure !
      </motion.div>
    </div>
  );
};

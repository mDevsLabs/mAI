'use client';

import { createStaticStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { m } from 'motion/react';
import { memo, useEffect, useRef, useState } from 'react';

import { useChatStore } from '@/store/chat';
import { operationSelectors } from '@/store/chat/slices/operation/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/slices/settings/selectors';

const QUOTES = [
  { text: "Je ne perds jamais. Soit je gagne, soit j'apprends.", author: "Nelson Mandela" },
  { text: "Le seul moyen de faire du bon travail, c'est d'aimer ce que vous faites.", author: "Steve Jobs" },
  { text: "La vie est un mystère qu'il faut vivre, et non un problème à résoudre.", author: "Gandhi" },
  { text: "Dans vingt ans vous serez plus déçus par les choses que vous n'avez pas faites que par celles que vous avez faites.", author: "Mark Twain" },
  { text: "L'échec est seulement l'opportunité de recommencer d'une façon plus intelligente.", author: "Henry Ford" },
  { text: "Tout semble toujours impossible jusqu'à ce que ce soit fait.", author: "Nelson Mandela" },
  { text: "Ce qui ne me tue pas me rend plus fort.", author: "Friedrich Nietzsche" },
  { text: "Le plus grand risque est de n'en prendre aucun.", author: "Mark Zuckerberg" },
  { text: "La meilleure façon de prédire l'avenir est de le créer.", author: "Peter Drucker" },
  { text: "Si vous traversez l'enfer, continuez d'avancer.", author: "Winston Churchill" },
  { text: "Un voyage de mille lieues commence toujours par un premier pas.", author: "Lao Tseu" },
  { text: "La folie, c'est de faire toujours la même chose et de s'attendre à un résultat différent.", author: "Albert Einstein" },
  { text: "Il n'y a qu'une façon d'échouer, c'est d'abandonner avant d'avoir réussi.", author: "Georges Clemenceau" },
  { text: "Tout ce que l'esprit peut concevoir et croire, il peut l'accomplir.", author: "Napoleon Hill" },
  { text: "N'attendez pas. Le moment ne sera jamais le bon.", author: "Napoleon Hill" },
  { text: "L'avenir appartient à ceux qui croient à la beauté de leurs rêves.", author: "Eleanor Roosevelt" },
  { text: "Soyez le changement que vous voulez voir dans le monde.", author: "Gandhi" },
  { text: "Il est toujours trop tôt pour abandonner.", author: "Norman Vincent Peale" },
  { text: "Rien de grand ne s'est accompli dans le monde sans passion.", author: "Hegel" },
  { text: "N'essayez pas de devenir un homme qui a du succès. Essayez plutôt de devenir un homme qui a de la valeur.", author: "Albert Einstein" },
  { text: "Ne rêvez pas votre vie, mais vivez vos rêves.", author: "Mark Twain" },
  { text: "L'action est la clé fondamentale de tout succès.", author: "Pablo Picasso" },
  { text: "Il faut viser la lune, parce qu'au moins, si vous échouez, vous finirez dans les étoiles.", author: "Oscar Wilde" },
  { text: "La vie, c'est comme une bicyclette, il faut avancer pour ne pas perdre l'équilibre.", author: "Albert Einstein" },
  { text: "Fais de ta vie un rêve, et d'un rêve, une réalité.", author: "Antoine de Saint-Exupéry" },
  { text: "Les seules limites de nos réalisations de demain, ce sont nos doutes et nos hésitations d'aujourd'hui.", author: "Franklin D. Roosevelt" },
  { text: "Le bonheur n'est pas quelque chose de tout fait. Il vient de vos propres actions.", author: "Dalaï Lama" },
  { text: "Il n'y a pas de réussite facile ni d'échecs définitifs.", author: "Marcel Proust" },
  { text: "Un but sans plan n'est qu'un souhait.", author: "Antoine de Saint-Exupéry" },
  { text: "La chance ne sourit qu'aux esprits bien préparés.", author: "Louis Pasteur" },
  { text: "Agissez comme s'il était impossible d'échouer.", author: "Winston Churchill" },
  { text: "Vous ne trouverez jamais ce que vous ne cherchez pas.", author: "Confucius" },
  { text: "Celui qui déplace la montagne commence par enlever les petites pierres.", author: "Confucius" },
  { text: "Visez toujours la perfection, vous l'atteindrez peut-être.", author: "Salvador Dali" },
  { text: "Mieux vaut être optimiste et se tromper que pessimiste et avoir raison.", author: "Jack Penn" },
  { text: "La persévérance, c'est ce qui rend l'impossible possible.", author: "Léon Tolstoï" },
  { text: "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte.", author: "Winston Churchill" },
  { text: "Si vous voulez que la vie vous sourie, apportez-lui d'abord votre bonne humeur.", author: "Baruch Spinoza" },
  { text: "Pour accomplir de grandes choses, il ne suffit pas d'agir, il faut aussi rêver.", author: "Anatole France" },
  { text: "Ne crains pas d'avancer lentement, crains seulement de t'arrêter.", author: "Proverbe chinois" },
  { text: "L'optimisme est la foi qui mène à la réalisation.", author: "Helen Keller" },
  { text: "Ceux qui ne font rien ne se trompent jamais.", author: "Théodore de Banville" },
  { text: "Le moment présent a un avantage sur tous les autres : il nous appartient.", author: "Charles Caleb Colton" },
  { text: "Choisissez un travail que vous aimez et vous n'aurez pas à travailler un seul jour de votre vie.", author: "Confucius" },
  { text: "C'est dans l'effort que l'on trouve la satisfaction et non dans la réussite.", author: "Gandhi" },
  { text: "Le courage n'est pas l'absence de peur, mais la capacité de la vaincre.", author: "Nelson Mandela" },
  { text: "Tout homme a le droit de douter de sa tâche, et d'y faillir de temps en temps, mais il n'a pas le droit de s'en détourner.", author: "Paulo Coelho" },
  { text: "La vie est un défi à relever, un bonheur à mériter, une aventure à tenter.", author: "Mère Teresa" },
  { text: "Le succès, c'est tomber sept fois, se relever huit.", author: "Proverbe japonais" },
  { text: "Croyez en vos rêves et ils se réaliseront peut-être. Croyez en vous et ils se réaliseront sûrement.", author: "Martin Luther King" },
];

const ENCOURAGEMENTS = [
  { text: "Super question ! Voyons ça ensemble.", author: "mAI" },
  { text: "Tu es sur la bonne voie, continue !", author: "mAI" },
  { text: "Génial, j'adore cette idée !", author: "mAI" },
  { text: "C'est une excellente réflexion !", author: "mAI" },
  { text: "Je suis là pour t'aider à briller.", author: "mAI" },
  { text: "Rien ne t'arrête aujourd'hui !", author: "mAI" },
  { text: "Quelle belle inspiration !", author: "mAI" },
  { text: "On fait une super équipe !", author: "mAI" },
  { text: "Ton esprit est vraiment vif aujourd'hui.", author: "mAI" },
  { text: "C'est un plaisir de discuter avec toi.", author: "mAI" },
  { text: "Continue comme ça, tu gères !", author: "mAI" },
  { text: "Je suis prêt(e), allons-y !", author: "mAI" },
  { text: "Encore une belle réussite en perspective.", author: "mAI" },
  { text: "Tu poses toujours les bonnes questions.", author: "mAI" },
  { text: "C'est parti pour une nouvelle aventure !", author: "mAI" },
  { text: "Ta curiosité est ta plus grande force.", author: "mAI" },
  { text: "On va faire des merveilles avec ça.", author: "mAI" },
  { text: "C'est toujours un bonheur de t'assister.", author: "mAI" },
  { text: "Bravo pour cette belle avancée !", author: "mAI" },
  { text: "Tu m'impressionnes de jour en jour.", author: "mAI" }
];

const styles = createStaticStyles(({ css }) => ({
  fadeInUp: css`
    @keyframes petFadeInUp {
      from {
        opacity: 0;
        transform: translate(-50%, 10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0) scale(1);
      }
    }
    animation: petFadeInUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  `,
}));

const Pet = memo(
  ({
    petId,
    isGenerating,
    index,
    zoom,
    config,
  }: {
    petId: string;
    isGenerating: boolean;
    index: number;
    zoom: number;
    config: any;
  }) => {
    const [animation, setAnimation] = useState<string>('waving');
    const [mounted, setMounted] = useState(false);
    const [currentQuote, setCurrentQuote] = useState<{ text: string; author: string } | null>(null);
    const [showQuote, setShowQuote] = useState(false);
    const quoteTimerRef = useRef<any>(null);

    // Store previous isGenerating value to detect changes
    const prevIsGenerating = useRef(isGenerating);

    useEffect(() => {
      setMounted(true);
      // Waving on mount for 2s
      const timer = setTimeout(() => {
        setAnimation(isGenerating ? 'waiting' : 'idle');
      }, 2000);
      return () => clearTimeout(timer);
    }, []);

    // Play sound and update animation when AI starts or stops responding
    useEffect(() => {
      if (!mounted) return;
      if (isGenerating !== prevIsGenerating.current) {
        prevIsGenerating.current = isGenerating;

        // Play pet sound on AI action
        if (config?.petsSound && isGenerating) {
          try {
            const audio = new Audio(`/pets/${petId}/${petId}.mp3`);
            audio.volume = config?.petsVolume ?? 0.5;
            audio.play();
          } catch (_e) {
            // Ignore audio errors
          }
        }

        if (isGenerating && config?.petsEncouragements) {
           const randomIndex = Math.floor(Math.random() * ENCOURAGEMENTS.length);
           setCurrentQuote(ENCOURAGEMENTS[randomIndex]);
           setShowQuote(true);
           setAnimation('jumping');
           if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current);
           quoteTimerRef.current = setTimeout(() => {
             setShowQuote(false);
             setAnimation('running');
           }, 4000);
        } else {
           setAnimation(isGenerating ? 'running' : 'idle');
           if (!isGenerating) {
             setShowQuote(false);
           }
        }
      }
    }, [isGenerating, mounted, petId, config]);

    if (!mounted) return null;

    const size = 80 * zoom;
    const startX = window.innerWidth - (size + 40) - index * (size + 20);
    const startY = window.innerHeight - (size + 70);

    const handleInteraction = () => {
      // Play sound
      if (config?.petsSound) {
        try {
          const audio = new Audio(`/pets/${petId}/${petId}.mp3`);
          audio.volume = config?.petsVolume ?? 0.5;
          audio.play();
        } catch (_e) {
          // Ignore audio errors
        }
      }

      // Pick a random quote if citations are enabled
      if (config?.petsCitations) {
        const randomIndex = Math.floor(Math.random() * QUOTES.length);
        setCurrentQuote(QUOTES[randomIndex]);
        setShowQuote(true);
      } else {
        setShowQuote(false);
      }

      // Temporarily change animation to jumping or waving
      const possibleAnimations = ['jumping', 'waving'];
      const chosenAnim = possibleAnimations[Math.floor(Math.random() * possibleAnimations.length)];
      setAnimation(chosenAnim);

      // Reset quote timer
      if (quoteTimerRef.current) {
        clearTimeout(quoteTimerRef.current);
      }

      quoteTimerRef.current = setTimeout(() => {
        setShowQuote(false);
        setAnimation(isGenerating ? 'running' : 'idle');
      }, 4000);
    };

    const getContainerStyle = (): React.CSSProperties => {
      const style: React.CSSProperties = {
        width: size,
        height: size,
        cursor: 'grab',
        position: 'relative',
      };

      // Aura
      if (config?.petsAura) {
        style.filter = 'drop-shadow(0 0 15px var(--color-primary)) drop-shadow(0 0 5px var(--color-primary))';
      } else {
        style.filter = 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))';
      }

      // Color Filter
      if (config?.petsColor) {
        style.filter += ' hue-rotate(90deg)';
      }

      return style;
    };

    return (
      <m.div
        drag
        dragElastic={0.1}
        dragMomentum={false}
        initial={{ x: startX, y: startY }}
        onDrag={(_e, info) => {
          if (info.delta.x < 0) {
            setAnimation('running-left');
          } else if (info.delta.x > 0) {
            setAnimation('running-right');
          }
        }}
        onDragEnd={() => {
          setAnimation('idle');
        }}
        style={{
          cursor: 'grab',
          height: size,
          position: 'fixed',
          top: 0,
          left: 0,
          width: size,
          zIndex: 999999,
        }}
        whileDrag={{ cursor: 'grabbing' }}
      >
        <div style={{ position: 'relative' }}>
          {/* Quote Speech Bubble */}
          {showQuote && currentQuote && (
            <div
              className={styles.fadeInUp}
              style={{
                position: 'absolute',
                bottom: '120%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 260,
                backgroundColor: 'var(--color-bg-container)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                padding: '12px 16px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                zIndex: 10000,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  lineHeight: '1.4',
                  color: 'var(--color-text)',
                  fontWeight: '500',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                &ldquo;{currentQuote.text}&rdquo;
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-description)',
                  textAlign: 'right',
                  fontStyle: 'italic',
                }}
              >
                — {currentQuote.author}
              </div>
              {/* Triangular arrow tail */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(45deg)',
                  width: 12,
                  height: 12,
                  backgroundColor: 'var(--color-bg-container)',
                  borderRight: '1px solid var(--color-border)',
                  borderBottom: '1px solid var(--color-border)',
                }}
              />
            </div>
          )}

          <div style={getContainerStyle()} title={petId} onClick={handleInteraction}>
            {config?.petsBg && (
              <div
                style={{
                  position: 'absolute',
                  top: '5%',
                  left: '5%',
                  width: '90%',
                  height: '90%',
                  backgroundImage: 'url("/pets/background.png")',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  zIndex: -1,
                  borderRadius: '50%',
                }}
              />
            )}
            <img
              alt={petId}
              src={`/pets/${petId}/${petId}-${animation}.gif`}
              style={{
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                transition: config?.petsAnim ? 'transform 0.3s' : 'none',
                transform: animation === 'waving' || animation === 'jumping' ? 'scale(1.1)' : 'scale(1)',
              }}
            />
            {config?.petsAcc && (
              <div
                style={{
                  position: 'absolute',
                  top: '-15%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: size * 0.4,
                  pointerEvents: 'none',
                }}
              >
                🎩
              </div>
            )}
            {config?.petsWeather && (
              <div
                style={{
                  position: 'absolute',
                  top: '-20%',
                  right: '-40%',
                  fontSize: size * 0.2,
                  padding: '4px 10px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: 'black',
                  borderRadius: '12px',
                  borderBottomLeftRadius: '2px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  pointerEvents: 'none',
                  animation: 'float 3s ease-in-out infinite',
                  whiteSpace: 'nowrap',
                  fontWeight: 'bold',
                }}
              >
                Sunny ☀️
              </div>
            )}
          </div>
        </div>
      </m.div>
    );
  },
);

export const GlobalPets = memo(() => {
  const { general } = useUserStore(settingsSelectors.currentSettings, isEqual);
  const isGenerating = useChatStore(operationSelectors.isAgentRuntimeRunning);

  const selectedPets = general?.pets || [];
  const petsZoom = general?.petsZoom || 1;
  const enablePets = general?.enablePets ?? false;

  if (!enablePets || selectedPets.length === 0) return null;

  return (
    <>
      {selectedPets.map((petId, index) => (
        <Pet
          config={general}
          index={index}
          isGenerating={isGenerating}
          key={petId}
          petId={petId}
          zoom={petsZoom}
        />
      ))}
    </>
  );
});

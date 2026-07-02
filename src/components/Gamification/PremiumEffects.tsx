import { createStaticStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';

const styles = createStaticStyles(({ css, cssVar }) => ({
  sparkleContainer: css`
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    border-radius: inherit;
  `,
  sparkle: css`
    position: absolute;
    width: 6px;
    height: 6px;
    background: ${cssVar.colorWarning};
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    animation: sparkleAnim 0.8s ease-in-out forwards;
    opacity: 0;

    @keyframes sparkleAnim {
      0% {
        transform: scale(0) rotate(0deg);
        opacity: 0;
      }
      50% {
        opacity: 1;
      }
      100% {
        transform: scale(1.5) rotate(90deg) translate(var(--tx), var(--ty));
        opacity: 0;
      }
    }
  `,
  mythicCard: css`
    position: relative;
    overflow: hidden;
    &::after {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: inherit;
      background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
      background-size: 400%;
      z-index: -1;
      animation: glowing 20s linear infinite;
      opacity: 0.7;
      transform: translateZ(0);
      backface-visibility: hidden;
    }

    @keyframes glowing {
      0% { background-position: 0 0; }
      50% { background-position: 400% 0; }
      100% { background-position: 0 0; }
    }
  `,
  ultraCard: css`
    position: relative;
    overflow: hidden;
    &::after {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: inherit;
      background: linear-gradient(45deg, #ff00c8, #7a00ff, #002bff, #00ffd5, #ff00c8);
      background-size: 400%;
      z-index: -1;
      animation: glowing 10s linear infinite;
      opacity: 1;
      filter: blur(5px);
      transform: translateZ(0);
      backface-visibility: hidden;
    }
  `
}));

export const SparkleExplosion: React.FC<{ active: boolean; onComplete?: () => void }> = ({ active, onComplete }) => {
  const [sparkles, setSparkles] = useState<any[]>([]);

  useEffect(() => {
    if (active) {
      const newSparkles = Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 20 + Math.random() * 20;
        const delay = (12 - i) * 0.02;
        return {
          id: i,
          tx: `${Math.cos(angle) * radius}px`,
          ty: `${Math.sin(angle) * radius}px`,
          delay,
          animationStartTime: performance.now() + delay * 1000,
        };
      });
      setSparkles(newSparkles);

      const timer = setTimeout(() => {
        setSparkles([]);
        onComplete?.();
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!active && sparkles.length === 0) return null;

  return (
    <div className={styles.sparkleContainer}>
      {sparkles.map((s) => (
        <div
          key={s.id}
          className={styles.sparkle}
          style={{ '--tx': s.tx, '--ty': s.ty, left: '50%', top: '50%' } as any}
        />
      ))}
    </div>
  );
};

export interface PremiumCardWrapperProps {
  active?: boolean;
  children: React.ReactNode;
  className?: string;
  rarity?: string;
  style?: React.CSSProperties;
}

export const PremiumCardWrapper: React.FC<PremiumCardWrapperProps> = ({
  active = true,
  children,
  className,
  rarity,
  style,
}) => {
  if (!active) return <>{children}</>;

  let effectClass = '';
  if (rarity === 'Mythic') {
    effectClass = styles.mythicCard;
  } else if (rarity === 'Ultra') {
    effectClass = styles.ultraCard;
  }

  if (!effectClass) return <>{children}</>;

  return (
    <div className={className ? `${effectClass} ${className}` : effectClass} style={style}>
      {children}
    </div>
  );
};


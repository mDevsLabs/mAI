'use client';

import { Flexbox } from '@lobehub/ui';
import { Typography, Progress } from 'antd';
import { createStaticStyles, useTheme } from 'antd-style';
import React from 'react';

import { useGamificationStore } from '@/store/gamification';

const { Title, Text } = Typography;

export const styles = createStaticStyles(({ css, cssVar }) => ({
  container: css`
    padding: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 48px;
    background: radial-gradient(circle at top, color-mix(in srgb, ${cssVar.colorPrimary} 12%, transparent) 0%, transparent 60%);
    min-height: 100%;
    animation: fadeIn 0.8s ease-out;

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
  levelCircle: css`
    position: relative;
    width: 300px;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: ${cssVar.colorFillTertiary};
    box-shadow: 0 0 40px ${cssVar.colorPrimaryBorder};
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: pulseGlow 4s ease-in-out infinite;
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 0 60px ${cssVar.colorPrimary};
    }

    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 30px ${cssVar.colorPrimaryBorder}; }
      50% { box-shadow: 0 0 50px ${cssVar.colorPrimary}; }
    }
  `,
  levelNumber: css`
    font-size: 96px;
    font-weight: 900;
    line-height: 1;
    background: linear-gradient(135deg, ${cssVar.colorPrimary}, ${cssVar.colorInfo});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `,
  progressText: css`
    margin-top: 16px;
    font-size: 20px;
    color: ${cssVar.colorTextSecondary};
    font-weight: bold;
    letter-spacing: 0.5px;
  `,
  statsGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
    width: 100%;
    max-width: 800px;
  `,
  statCard: css`
    text-align: center;
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(10px);
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 16px;
    padding: 24px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.05);
      border-color: ${cssVar.colorPrimary};
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
  `
}));

export const LevelsPage = () => {
  const token = useTheme();
  const xp = useGamificationStore((s) => s.xp);
  const level = useGamificationStore((s) => s.level);
  
  // Basic curve: 200 MP per level
  const currentLevelXp = xp - ((level - 1) * 200);
  const progressPercent = Math.min(100, Math.max(0, Math.floor((currentLevelXp / 200) * 100)));

  return (
    <div className={styles.container}>
      <Flexbox align="center" gap={8}>
        <Title level={2} style={{ margin: 0 }}>Niveau</Title>
        <Text type="secondary">Explorez, progressez et débloquez des récompenses exclusives.</Text>
      </Flexbox>
      
      <div className={styles.levelCircle}>
        <Progress 
          type="circle" 
          percent={progressPercent} 
          size={300} 
          strokeWidth={6}
          strokeColor={{ '0%': token.colorPrimary, '100%': token.colorInfo }}
          format={() => (
            <Flexbox align="center" gap={0} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <Text type="secondary" style={{ fontSize: 16, textTransform: 'uppercase', letterSpacing: 2 }}>Niveau</Text>
              <div className={styles.levelNumber}>{level}</div>
            </Flexbox>
          )}
        />
      </div>

      <div className={styles.progressText}>
        {currentLevelXp} / 200 MP
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>MP Total</Text>
          <Title level={3} style={{ margin: 0 }}>{xp}</Title>
        </div>
        <div className={styles.statCard}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Actions Réalisées</Text>
          <Title level={3} style={{ margin: 0 }}>{Object.values(useGamificationStore.getState().actionCounts).reduce((a, b) => a + b, 0)}</Title>
        </div>
        <div className={styles.statCard}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Badges Débloqués</Text>
          <Title level={3} style={{ margin: 0 }}>{useGamificationStore.getState().unlockedBadges.length}</Title>
        </div>
      </div>
    </div>
  );
};

export default LevelsPage;

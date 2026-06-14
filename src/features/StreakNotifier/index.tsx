'use client';

import { App } from 'antd';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useTranslation } from 'react-i18next';

import { useClientDataSWR } from '@/libs/swr';
import { HeatmapType } from '@/routes/(main)/settings/stats/types';
import { messageService } from '@/services/message';

const StreakNotifier = () => {
  const { t } = useTranslation('auth');
  const { message } = App.useApp();
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiConfig, setConfettiConfig] = useState<{
    colors?: string[];
    numberOfPieces: number;
  }>({ numberOfPieces: 500 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const { data } = useClientDataSWR(['stats-heatmaps', HeatmapType.Tokens].join('-'), () =>
    messageService.getTokenHeatmaps(),
  );

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (data && data.length > 0) {
      let current = 0;
      for (let i = data.length - 1; i >= 0; i -= 1) {
        if (data[i].count > 0) current += 1;
        else if (i === data.length - 1) continue;
        else break;
      }

      if (current > 0) {
        const toastShown = sessionStorage.getItem('streak-toast-shown');
        if (!toastShown) {
          message.success({
            content: `🔥 ${current} ${t('stats.days', { defaultValue: 'jours de suite !' })}`,
            duration: 5,
          });
          sessionStorage.setItem('streak-toast-shown', 'true');

          if (current === 30 || current % 50 === 0) {
            let colors: string[] | undefined = undefined;
            let pieces = 500;

            if (current === 100) {
              colors = [
                '#f44336',
                '#e91e63',
                '#9c27b0',
                '#673ab7',
                '#3f51b5',
                '#2196f3',
                '#03a9f4',
                '#00bcd4',
                '#009688',
                '#4CAF50',
                '#8BC34A',
                '#CDDC39',
                '#FFEB3B',
                '#FFC107',
                '#FF9800',
                '#FF5722',
              ];
              pieces = 1500;
            } else if (current === 50) {
              colors = ['#FFD700', '#DAA520', '#B8860B'];
              pieces = 800;
            }

            setConfettiConfig({ colors, numberOfPieces: pieces });
            setShowConfetti(true);
            timer = setTimeout(() => setShowConfetti(false), 5000);
          }
        }
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [data, message, t]);

  if (!showConfetti) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}>
      <Confetti
        colors={confettiConfig.colors}
        height={windowSize.height}
        numberOfPieces={confettiConfig.numberOfPieces}
        recycle={false}
        width={windowSize.width}
      />
    </div>
  );
};

export default StreakNotifier;

'use client';

import isEqual from 'fast-deep-equal';
import { memo, useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';

import { useChatStore } from '@/store/chat';
import { operationSelectors } from '@/store/chat/slices/operation/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/slices/settings/selectors';

const Pet = memo(({ petId, isGenerating, index, zoom, config }: { petId: string; isGenerating: boolean; index: number; zoom: number; config: any }) => {
  const [animation, setAnimation] = useState<'idle' | 'running' | 'waiting' | 'waving'>('waving');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Waving on mount for 2s
    const timer = setTimeout(() => {
      setAnimation(isGenerating ? 'waiting' : 'idle');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setAnimation(isGenerating ? 'running' : 'idle');
  }, [isGenerating, mounted]);

  if (!mounted) return null;

  const size = 80 * zoom;
  const startX = window.innerWidth - (size + 40) - index * (size + 20);
  const startY = window.innerHeight - (size + 70);

  const handleInteraction = () => {
    if (config?.petsSound) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = config?.petsVoice ? 'square' : 'sine';
        osc.frequency.setValueAtTime(config?.petsVoice ? 800 : 400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch (e) {
        // Ignore audio errors
      }
    }
    if (config?.petsAnim) {
      setAnimation('waving');
      setTimeout(() => {
        setAnimation(isGenerating ? 'running' : 'idle');
      }, 1500);
    }
  };

  const getContainerStyle = () => {
    let style: React.CSSProperties = {
      width: size,
      height: size,
      cursor: 'grab',
      position: 'relative',
    };
    
    // Aura
    if (config?.petsAura) {
      style.filter = 'drop-shadow(0 0 10px var(--color-primary))';
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
    <Rnd
      default={{
        x: startX,
        y: startY,
        width: size,
        height: size,
      }}
      enableResizing={false}
      bounds="window"
      style={{ zIndex: 9999, position: 'fixed' }}
    >
      <div title={petId} style={getContainerStyle()} onMouseDown={handleInteraction}>
        {config?.petsBg && (
          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', background: 'radial-gradient(circle, var(--color-primary-light) 0%, transparent 70%)', zIndex: -1, borderRadius: '50%' }} />
        )}
        <img
          src={`/pets/${petId}/${petId}-${animation}.gif`}
          alt={petId}
          style={{ width: '100%', height: '100%', pointerEvents: 'none', transition: config?.petsAnim ? 'transform 0.3s' : 'none', transform: animation === 'waving' ? 'scale(1.1)' : 'scale(1)' }}
        />
        {config?.petsAcc && (
          <div style={{ position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)', fontSize: size * 0.4, pointerEvents: 'none' }}>
            🎩
          </div>
        )}
        {config?.petsWeather && (
          <div style={{ position: 'absolute', top: '-30%', right: '-10%', fontSize: size * 0.3, pointerEvents: 'none', animation: 'float 3s ease-in-out infinite' }}>
            🌤️
          </div>
        )}
      </div>
    </Rnd>
  );
});

export const GlobalPets = memo(() => {
  const { general } = useUserStore(settingsSelectors.currentSettings, isEqual);
  const setSettings = useUserStore((s) => s.setSettings);
  const isGenerating = useChatStore(operationSelectors.isAgentRuntimeRunning);
  const [prevGenerating, setPrevGenerating] = useState(isGenerating);

  useEffect(() => {
    // Gain XP when generation stops (message completed)
    if (prevGenerating && !isGenerating) {
      const currentLevel = general?.petsLevel || 1;
      if (currentLevel < 100) {
        setSettings({ general: { petsLevel: Math.min(100, currentLevel + 1) } });
      }
    }
    setPrevGenerating(isGenerating);
  }, [isGenerating, prevGenerating, general?.petsLevel, setSettings]);

  const selectedPets = general?.pets || [];
  const petsZoom = general?.petsZoom || 1;
  const enablePets = general?.enablePets ?? false;

  if (!enablePets || selectedPets.length === 0) return null;

  return (
    <>
      {selectedPets.map((petId, index) => (
        <Pet key={petId} petId={petId} isGenerating={isGenerating} index={index} zoom={petsZoom} config={general} />
      ))}
    </>
  );
});

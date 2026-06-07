'use client';

import isEqual from 'fast-deep-equal';
import { memo, useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';

import { useChatStore } from '@/store/chat';
import { operationSelectors } from '@/store/chat/slices/operation/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/slices/settings/selectors';

const Pet = memo(({ petId, isGenerating, index, zoom }: { petId: string; isGenerating: boolean; index: number; zoom: number }) => {
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
      <div
        title={petId}
        style={{
          width: size,
          height: size,
          cursor: 'grab',
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
        }}
      >
        <img
          src={`/pets/${petId}/${petId}-${animation}.gif`}
          alt={petId}
          style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
        />
      </div>
    </Rnd>
  );
});

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
        <Pet key={petId} petId={petId} isGenerating={isGenerating} index={index} zoom={petsZoom} />
      ))}
    </>
  );
});

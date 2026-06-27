let audioCtx: AudioContext | null = null;

export const playGamificationSound = (type: 'questClaim' | 'badgeUnlock', volume: number = 0.7) => {
  if (typeof window === 'undefined') return;
  if (volume <= 0) return;

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const gainNode = audioCtx.createGain();
  gainNode.gain.value = volume;
  gainNode.connect(audioCtx.destination);

  if (type === 'questClaim') {
    // Jouer un petit carillon rapide
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.connect(gainNode);
    
    // Notes rapides: Do(5) Mi(5) Sol(5)
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
    osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
    
    // Fade out
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } else if (type === 'badgeUnlock') {
    // Jouer un effet "harpe magique"
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.connect(gainNode);
    
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, i) => {
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.15);
    });

    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);
  }
};

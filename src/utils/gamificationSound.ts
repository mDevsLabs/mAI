/**
 * Synthétiseur d'effets sonores Web Audio API pour la gamification.
 * Génère des sons à la volée de manière autonome sans requérir de fichiers externes.
 */

export type GamificationSoundType = 'chime' | 'arpeggio' | 'levelUp';

export const playGamificationSound = (type: GamificationSoundType) => {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    if (type === 'chime') {
      // Un son de carillon doux cristallin (idéal pour débloquer un badge normal)
      const now = ctx.currentTime;

      const playNote = (freq: number, delay: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        // Harmonique aiguë douce
        const triOsc = ctx.createOscillator();
        const triGain = ctx.createGain();
        triOsc.type = 'triangle';
        triOsc.frequency.setValueAtTime(freq * 2, now + delay);

        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.12, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);

        triGain.gain.setValueAtTime(0, now + delay);
        triGain.gain.linearRampToValueAtTime(0.04, now + delay + 0.01);
        triGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration * 0.5);

        osc.connect(gain);
        triOsc.connect(triGain);

        gain.connect(ctx.destination);
        triGain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + duration);
        triOsc.start(now + delay);
        triOsc.stop(now + delay + duration);
      };

      // Accord cristallin rapide (C6, E6, G6)
      playNote(1046.50, 0, 0.6);      // C6
      playNote(1318.51, 0.06, 0.6);   // E6
      playNote(1567.98, 0.12, 0.8);   // G6
    } else if (type === 'arpeggio') {
      // Une harpe magique ascendante (parfait pour la réclamation de quête ou badge mythic/ultra)
      const now = ctx.currentTime;
      // Accord de Do majeur 9 (C5, E5, G5, B5, D6, G6)
      const freqs = [523.25, 659.25, 783.99, 987.77, 1174.66, 1567.98];

      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.05);

        gain.gain.setValueAtTime(0, now + index * 0.05);
        gain.gain.linearRampToValueAtTime(0.1, now + index * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.05 + 0.8);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, now + index * 0.05);
        filter.frequency.exponentialRampToValueAtTime(600, now + index * 0.05 + 0.6);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.05);
        osc.stop(now + index * 0.05 + 1.0);
      });
    } else if (type === 'levelUp') {
      // Fanfare rétro et joyeuse de montée de niveau
      const now = ctx.currentTime;
      // Arpège ascendant suivi d'une note longue tenue
      const melody = [
        { freq: 523.25, time: 0, dur: 0.1 },     // C5
        { freq: 659.25, time: 0.1, dur: 0.1 },   // E5
        { freq: 783.99, time: 0.2, dur: 0.1 },   // G5
        { freq: 1046.50, time: 0.3, dur: 0.4 },  // C6 (tenu)
      ];

      melody.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle'; // Un son légèrement rétro 8-bit mais doux
        osc.frequency.setValueAtTime(note.freq, now + note.time);

        gain.gain.setValueAtTime(0, now + note.time);
        gain.gain.linearRampToValueAtTime(0.15, now + note.time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.time);
        osc.stop(now + note.time + note.dur);
      });
    }
  } catch (e) {
    console.error('Failed to play sound effect:', e);
  }
};

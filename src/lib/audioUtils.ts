/**
 * Utilities for generating sound feedback natively using Web Audio API. 
 * Doesn't require external audio files and triggers instantly.
 */

let audioCtx: AudioContext | null = null;

export const playSuccessSound = () => {
  try {
    // Initialize exactly once per app to follow browser policies (usually after user interaction)
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Attempt to resume if suspended
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Beep characteristics
    oscillator.type = 'sine';
    // Frequency corresponding to a high clear beep
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);

    // Volume envelope: Starts at 10% volume, instantly ramps down for a crisp sound
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    // Play for 0.1 seconds
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch (err) {
    console.error("Audio playback error:", err);
  }
};

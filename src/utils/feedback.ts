/**
 * Utilitário de feedback tátil e sonoro suave para a calculadora.
 * Utiliza Web Audio API gerando síntese senoidal ultracurta
 * e Vibration API em smartphones compatíveis.
 */

class FeedbackManager {
  private audioCtx: AudioContext | null = null;
  public soundEnabled: boolean = false;
  public hapticEnabled: boolean = true;

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public playKeyClick(type: 'number' | 'operator' | 'action' | 'equals') {
    if (this.hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(type === 'equals' ? 25 : 12);
      } catch {
        // Ignora caso restrito
      }
    }

    if (!this.soundEnabled) return;

    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      const freqs = {
        number: 440,
        operator: 520,
        action: 320,
        equals: 660,
      };

      const now = this.audioCtx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqs[type] || 440, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Ignora erro
    }
  }
}

export const feedback = new FeedbackManager();

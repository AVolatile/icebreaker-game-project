export type SoundCue =
  | "join"
  | "transition"
  | "lock"
  | "reveal"
  | "voting"
  | "leaderboard"
  | "complete"
  | "winner"
  | "tick";

const CUES: Record<
  SoundCue,
  { notes: number[]; step: number; length: number }
> = {
  join: { notes: [440, 660], step: 0.08, length: 0.12 },
  transition: { notes: [392, 523, 659], step: 0.065, length: 0.12 },
  lock: { notes: [294, 196], step: 0.065, length: 0.08 },
  reveal: { notes: [220, 330, 440], step: 0.08, length: 0.14 },
  voting: { notes: [523, 440, 659], step: 0.075, length: 0.12 },
  leaderboard: { notes: [392, 494, 587], step: 0.07, length: 0.12 },
  complete: { notes: [330, 440], step: 0.09, length: 0.15 },
  winner: { notes: [262, 330, 392, 523], step: 0.08, length: 0.18 },
  tick: { notes: [660], step: 0, length: 0.045 },
};

/** Host-owned synthesized stingers. Nothing is queued while audio is suspended. */
export class HostSounds {
  private audio: AudioContext | null = null;
  private voices = new Map<OscillatorNode, GainNode>();
  private disposed = false;

  constructor(private createContext = () => new AudioContext()) {}

  /** Called directly from the existing sound button / M gesture. */
  unlock() {
    if (this.disposed) return;
    try {
      this.audio ??= this.createContext();
      void this.audio.resume().catch(() => undefined);
    } catch {
      // Browser restrictions never participate in gameplay.
    }
  }

  play(kind: SoundCue, intensity = 1) {
    const audio = this.audio;
    if (this.disposed || !audio || audio.state !== "running") return;
    try {
      const { notes, step, length } = CUES[kind];
      notes.forEach((frequency, index) => {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        this.voices.set(osc, gain);
        const at = audio.currentTime + index * step;
        osc.type = "sine";
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(0.045 * intensity, at + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, at + length);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.onended = () => {
          this.voices.delete(osc);
          osc.disconnect();
          gain.disconnect();
        };
        osc.start(at);
        osc.stop(at + length + 0.02);
      });
    } catch {
      this.stop();
    }
  }

  stop() {
    for (const [osc, gain] of this.voices) {
      try {
        gain.disconnect();
        osc.stop();
        osc.disconnect();
      } catch {
        // A voice may already have ended.
      }
    }
    this.voices.clear();
  }

  dispose() {
    this.disposed = true;
    this.stop();
    try {
      void this.audio?.close().catch(() => undefined);
    } catch {
      // Unavailable contexts are safe to release.
    }
    this.audio = null;
  }
}

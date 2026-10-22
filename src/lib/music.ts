import type { GameId, Phase } from "../../shared/types";

// Original MP3 assets copied unchanged from production/main; see docs/HOST-MUSIC.md.
export const MUSIC_TRACKS = {
  lobby: "/audio/lobby.6879994317da.mp3",
  intro: "/audio/intro.697ba0dd1343.mp3",
  hotwire: "/audio/hotwire.fed5ea6cb679.mp3",
  "room-temperature": "/audio/room-temperature.c832606d0cf5.mp3",
  sellout: "/audio/sellout.1a062e780c93.mp3",
  "caption-this": "/audio/caption-this.65b8be84e833.mp3",
  "odd-one-in": "/audio/odd-one-in.f581a0276fdb.mp3",
  "scribble-shift": "/audio/scribble-shift.cd3c4cc07762.mp3",
  results: "/audio/results.b378461ddb3b.mp3",
  intermission: "/audio/intermission.748efc0c877c.mp3",
  finale: "/audio/finale.2e959cbb7737.mp3",
} as const;
export type MusicTrack = keyof typeof MUSIC_TRACKS;

export function musicTrackFor(phase: Phase, game: GameId): MusicTrack | null {
  switch (phase) {
    case "active":
    case "voting":
      return game;
    case "final":
      return "finale";
    case "ended":
      return null;
    default:
      return phase;
  }
}

const BACKGROUND_VOLUME = 0.18;
const FADE_IN_MS = 180;

/** One host-owned element. Playback is opt-in and never participates in game state. */
export class HostMusic {
  private audio: HTMLAudioElement | null = null;
  private track: MusicTrack | null = null;
  private muted = true;
  private disposed = false;
  private generation = 0;
  private fade: ReturnType<typeof setInterval> | undefined;

  constructor(
    private createAudio: () => HTMLAudioElement = () => new Audio(),
  ) {}

  setTrack(track: MusicTrack | null) {
    if (this.disposed || track === this.track) return;
    this.track = track;
    this.cancelFade();
    this.generation++;
    try {
      if (this.audio) {
        this.audio.pause();
        if (track) this.audio.src = MUSIC_TRACKS[track];
        else {
          this.audio.removeAttribute("src");
          this.audio.load();
        }
      }
      this.play();
    } catch {
      // Missing assets or unavailable media must never interrupt the room.
    }
  }

  /** Call directly from the sound button/key gesture, before React effects run. */
  setMuted(muted: boolean) {
    if (this.disposed) return;
    this.muted = muted;
    this.cancelFade();
    this.generation++;
    try {
      if (this.audio) {
        this.audio.muted = muted;
        if (muted) this.audio.pause();
      }
      if (!muted) this.play();
    } catch {
      // Mute and gameplay remain usable even when media APIs fail.
    }
  }

  private play() {
    if (this.disposed || this.muted || !this.track) return;
    try {
      if (!this.audio) {
        const audio = this.createAudio();
        this.audio = audio;
        audio.loop = true;
        audio.preload = "none";
        audio.src = MUSIC_TRACKS[this.track];
      }
      const audio = this.audio;
      const generation = ++this.generation;
      audio.muted = false;
      audio.volume = 0;
      // Do not defer play(): the first call must retain browser user activation.
      void audio
        .play()
        .then(() => {
          if (this.disposed || this.muted || generation !== this.generation)
            return;
          const started = Date.now();
          // A short fade-in softens source changes without overlapping tracks.
          this.fade = setInterval(() => {
            try {
              const progress = Math.min(1, (Date.now() - started) / FADE_IN_MS);
              audio.volume = BACKGROUND_VOLUME * progress;
              if (progress === 1) this.cancelFade();
            } catch {
              this.cancelFade();
            }
          }, 30);
        })
        .catch(() => {
          // Autoplay rejection, network failure and aborted plays are harmless.
          // A later unmute gesture can retry; room updates never spin retries.
        });
    } catch {
      // Audio may be unavailable entirely (including during construction).
    }
  }

  private cancelFade() {
    clearInterval(this.fade);
    this.fade = undefined;
  }

  dispose() {
    this.disposed = true;
    this.generation++;
    this.cancelFade();
    const audio = this.audio;
    this.audio = null;
    try {
      if (audio) {
        audio.muted = true;
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
    } catch {
      // Cleanup must also be safe when media support is unavailable.
    }
  }
}

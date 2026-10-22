import type { RoomView } from "../../shared/types";
import { gameForRoom } from "../../shared/catalog";
import { HostMusic, musicTrackFor } from "./music";
import { HostSounds, type SoundCue } from "./sound";

const NORMAL_VOLUME = 0.18;
const VOTING_VOLUME = 0.14;
const RESULTS_VOLUME = 0.12;
const QUESTION_BREATH_MS = 450;
const SHORT_BED_MS = 3400;

/** Existing room state in, host-only presentation out. Never sends game actions. */
export class HostAudio {
  private room: RoomView | null = null;
  private previous: RoomView | null = null;
  private disconnectedRoom: RoomView | null = null;
  private finalePresented = false;
  private muted = true;
  private disposed = false;
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private bedExpiresAt = 0;
  private offset = 0;
  private lastSecond = 0;
  private countdown = new Set<number>();

  constructor(
    private music = new HostMusic(),
    private sounds = new HostSounds(),
  ) {}

  sync(room: RoomView | null, connected: boolean, finalePresented = false) {
    if (this.disposed) return;
    this.room = room;
    this.finalePresented = finalePresented;
    if (!room || !connected) {
      this.disconnectedRoom = room;
      this.previous = null;
      this.cancelSequence();
      this.music.setTrack(null);
      return;
    }
    // PartyProvider marks the socket connected before its resume reply arrives.
    // Wait for a fresh room object rather than treating its cached view as an edge.
    if (room === this.disconnectedRoom) return;
    this.disconnectedRoom = null;
    const previous = this.previous;
    const baseline =
      !previous ||
      previous.code !== room.code ||
      previous.createdAt !== room.createdAt;
    const questionChanged =
      !previous || questionKey(previous) !== questionKey(room);
    const phaseChanged = previous?.phase !== room.phase;
    const presentationChanged =
      room.phase === "final" && finalePresented && !this.musicFinaleReady;
    this.offset = room.serverTime - Date.now();
    if (
      baseline ||
      questionChanged ||
      phaseChanged ||
      previous.paused !== room.paused
    ) {
      this.lastSecond = this.remainingSeconds();
      if (baseline || questionChanged) this.countdown.clear();
    }
    this.previous = room;
    if (baseline || questionChanged || phaseChanged || presentationChanged) {
      this.cancelSequence();
      this.bedExpiresAt = Date.now() + SHORT_BED_MS;
      this.musicFinaleReady = room.phase === "final" && finalePresented;
      if (baseline || this.muted) {
        this.restoreBed();
        return;
      }
      this.transition(previous!, room, questionChanged);
    } else if (
      room.phase === "lobby" &&
      room.players.length > previous.players.length
    ) {
      this.cue("join");
    }
  }

  private musicFinaleReady = false;

  /** Current music only: missed event cues are discarded, including pending notes. */
  setMuted(muted: boolean) {
    if (this.disposed) return;
    this.muted = muted;
    this.cancelSequence();
    if (muted) this.music.setMuted(true);
    this.restoreBed();
    if (!muted) {
      this.sounds.unlock();
      // Keep play() in the original user gesture for browser autoplay policy.
      this.music.setMuted(false);
    }
  }

  private transition(
    previous: RoomView,
    room: RoomView,
    questionChanged: boolean,
  ) {
    const game = gameForRoom(room).id;
    if (room.phase === "final") {
      this.music.setTrack(null);
      if (this.finalePresented) {
        this.music.setVolume(NORMAL_VOLUME);
        this.music.setTrack("finale", { restart: true });
        this.cue("winner");
      }
    } else if (
      room.phase === "active" &&
      (questionChanged || previous.phase !== "active")
    ) {
      this.music.setTrack(null, { fadeOutMs: 90 });
      this.later(100, () => this.cue("transition"));
      this.later(QUESTION_BREATH_MS, () => {
        this.music.setVolume(NORMAL_VOLUME);
        this.music.setTrack(game, { restart: true });
      });
    } else if (room.phase === "voting") {
      // The same game bed keeps its position underneath the submission lock.
      this.music.setVolume(0.025, 60);
      this.cue("lock");
      this.later(300, () => this.cue("voting"));
      this.later(750, () => {
        this.music.setTrack(game);
        this.music.setVolume(VOTING_VOLUME);
      });
    } else if (room.phase === "results") {
      this.music.setTrack(null);
      if (previous.phase === "active" || previous.phase === "voting")
        this.cue("lock");
      const revealAt =
        game === "caption-this" ? 520 : game === "odd-one-in" ? 420 : 300;
      this.later(revealAt, () => this.cue("reveal"));
      this.later(revealAt + 550, () => {
        if (room.showLeaderboard !== false) this.cue("leaderboard");
      });
      this.later(revealAt + 850, () => {
        this.music.setVolume(RESULTS_VOLUME);
        this.music.setTrack("results", { loop: false });
      });
      this.expireBed();
    } else if (room.phase === "intro") {
      this.music.setTrack(null, { fadeOutMs: 90 });
      this.later(100, () => this.cue("transition"));
      this.later(450, () => {
        this.music.setVolume(NORMAL_VOLUME);
        this.music.setTrack("intro", { restart: true, loop: false });
      });
      this.expireBed();
    } else if (room.phase === "intermission") {
      this.music.setTrack(null, { fadeOutMs: 90 });
      this.later(100, () => this.cue("complete"));
      this.later(450, () => this.restoreBed());
    } else {
      this.restoreBed(previous.phase === "final" ? 180 : 0);
    }
  }

  private restoreBed(fadeOutMs = 0) {
    const room = this.room;
    if (!room || room === this.disconnectedRoom) {
      this.music.setTrack(null);
      return;
    }
    const short = room.phase === "intro" || room.phase === "results";
    const silent =
      (room.phase === "final" && !this.finalePresented) ||
      (short && Date.now() >= this.bedExpiresAt);
    this.music.setVolume(
      room.phase === "voting"
        ? VOTING_VOLUME
        : room.phase === "results"
          ? RESULTS_VOLUME
          : NORMAL_VOLUME,
    );
    this.music.setTrack(
      silent ? null : musicTrackFor(room.phase, gameForRoom(room).id),
      { loop: !short, fadeOutMs },
    );
    if (short && !silent) this.expireBed();
  }

  private expireBed() {
    this.later(Math.max(0, this.bedExpiresAt - Date.now()), () =>
      this.music.setTrack(null, { fadeOutMs: 120 }),
    );
  }

  private cue(cue: SoundCue) {
    if (this.muted || !this.room) return;
    const game = gameForRoom(this.room).id;
    const intensity =
      cue === "winner"
        ? 1
        : game === "room-temperature" || game === "scribble-shift"
          ? 0.65
          : game === "hotwire"
            ? 1
            : 0.8;
    this.sounds.play(cue, intensity);
  }

  private remainingSeconds() {
    return Math.max(
      0,
      Math.ceil(((this.room?.deadline ?? 0) - Date.now() - this.offset) / 1000),
    );
  }

  /** Mirrors Timer's server offset. Only Hotwire gets quiet ticks at 3, 2, 1. */
  tick() {
    const room = this.room;
    if (
      this.disposed ||
      !room ||
      !this.previous ||
      room.paused ||
      room.phase !== "active" ||
      gameForRoom(room).id !== "hotwire" ||
      !room.deadline
    )
      return;
    const seconds = this.remainingSeconds();
    const crossed = seconds === this.lastSecond - 1;
    this.lastSecond = seconds;
    if (!crossed || seconds < 1 || seconds > 3 || this.countdown.has(seconds))
      return;
    this.countdown.add(seconds);
    if (this.muted) return;
    this.music.setVolume(0.07, 45);
    this.cue("tick");
    this.later(150, () => this.music.setVolume(NORMAL_VOLUME));
  }

  private later(ms: number, task: () => void) {
    if (this.muted || this.disposed) return;
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      if (!this.disposed && !this.muted) task();
    }, ms);
    this.timers.add(timer);
  }

  private cancelSequence() {
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.sounds.stop();
  }

  dispose() {
    this.disposed = true;
    this.cancelSequence();
    this.music.dispose();
    this.sounds.dispose();
  }
}

// roundKey is `${roundSequence}:${phase}` in this demo. Its sequence survives
// rematches; the indices also cover game changes without inventing game state.
export function questionKey(room: RoomView) {
  return `${room.code}:${room.createdAt}:${room.gameIndex}:${room.round}:${room.roundKey.split(":")[0]}`;
}

let audio: AudioContext | undefined;
export function playSound(kind: "join" | "reveal" | "winner" | "tick") {
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const notes =
      kind === "winner"
        ? [261.6, 329.6, 392, 523.2]
        : kind === "join"
          ? [440, 660]
          : kind === "reveal"
            ? [220, 330, 440]
            : [800];
    notes.forEach((freq, i) => {
      const osc = audio!.createOscillator(),
        gain = audio!.createGain(),
        at = audio!.currentTime + i * 0.1;
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.045, at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.2);
      osc.connect(gain);
      gain.connect(audio!.destination);
      osc.start(at);
      osc.stop(at + 0.22);
    });
  } catch {
    /* Muted or unavailable audio never interrupts gameplay. */
  }
}

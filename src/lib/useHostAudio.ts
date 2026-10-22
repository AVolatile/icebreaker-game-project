import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { RoomView } from "../../shared/types";
import { HostAudio } from "./hostAudio";

export function useHostAudio(room: RoomView | null, connected: boolean) {
  const controller = useRef<HostAudio | null>(null);
  const presented = useRef<RoomView | null>(null);
  const [muted, setMuted] = useState(true);

  useLayoutEffect(() => {
    const audio = new HostAudio();
    controller.current = audio;
    const ticker = setInterval(() => audio.tick(), 100);
    return () => {
      clearInterval(ticker);
      audio.dispose();
      controller.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    if (room?.phase !== "final") presented.current = null;
    controller.current?.sync(room, connected, presented.current !== null);
  }, [room, connected]);

  // HostFinale calls this in the same commit that mounts winner + Confetti.
  // The ref also handles initial hydration / StrictMode child-before-parent setup.
  const onFinalePresented = useCallback(
    (finalRoom: RoomView) => {
      presented.current = finalRoom;
      controller.current?.sync(finalRoom, connected, true);
    },
    [connected],
  );

  const toggleSound = useCallback(() => {
    const next = !muted;
    controller.current?.setMuted(next);
    setMuted(next);
  }, [muted]);

  return { muted, toggleSound, onFinalePresented };
}

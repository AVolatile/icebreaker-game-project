import { DEFAULT_SETTINGS } from "../../shared/catalog";
import { validateBoard, type CustomBoard } from "../../shared/boards";
import type { Reply, Settings } from "../../shared/types";
export async function launchBoard(
  board: CustomBoard,
  create: (
    settings: Settings,
    demo?: boolean,
    board?: CustomBoard,
  ) => Promise<Reply>,
  demo = false,
) {
  return create(
    { ...DEFAULT_SETTINGS, playlist: ["hotwire"], rounds: 1 },
    demo,
    validateBoard(board),
  );
}

import {
  validateBoard,
  type CustomBoard,
  type CustomQuestion,
  newBoard,
} from "../../shared/boards";
export function download(
  name: string,
  data: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportBoard(board: CustomBoard) {
  validateBoard(board);
  download(
    `${board.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "ruckus-board"}.json`,
    JSON.stringify(board, null, 2),
  );
}
export function importJson(text: string): CustomBoard {
  if (text.length > 300000) throw new Error("Keep board imports under 300 KB.");
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error(
      "That file isn’t valid JSON. Export a Ruckus board and try again.",
    );
  }
  const board = validateBoard(value);
  const now = new Date().toISOString();
  return {
    ...board,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    questions: board.questions.map((q) => ({ ...q, id: crypto.randomUUID() })),
  };
}
export const CSV_TEMPLATE =
  "question,answer_a,answer_b,answer_c,answer_d,answer_e,answer_f,correct_answer,timer,score,explanation,type\nWhich shape has six sides?,Hexagon,Triangle,Square,Pentagon,,,A,20,casual,Hex means six.,multiple-choice\nCoffee or tea?,Coffee,Tea,,,,,,20,no-score,Every opinion welcome.,poll\n";
export function parseCsv(text: string): string[][] {
  if (text.length > 300000) throw new Error("Keep CSV imports under 300 KB.");
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if (c === "\n" && !quoted) {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (quoted) throw new Error("CSV has an unclosed quotation mark.");
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim()));
}
export function importCsv(text: string): CustomBoard {
  const rows = parseCsv(text);
  const headers =
    rows.shift()?.map((h) =>
      h
        .trim()
        .toLowerCase()
        .replace(/^\uFEFF/, ""),
    ) ?? [];
  if (!["question", "answer_a", "answer_b"].every((h) => headers.includes(h)))
    throw new Error(
      "CSV needs question, answer_a, and answer_b columns. Download the template.",
    );
  if (new Set(headers).size !== headers.length)
    throw new Error("CSV column names must be unique.");
  const board = newBoard();
  board.title = "Imported question board";
  board.questions = rows.map((row, order) => {
    const get = (key: string) => row[headers.indexOf(key)]?.trim() ?? "";
    const cells = ["a", "b", "c", "d", "e", "f"].map((letter) =>
      get(`answer_${letter}`),
    );
    const last = cells.length - 1 - [...cells].reverse().findIndex(Boolean);
    if (cells.slice(0, last + 1).some((a) => !a))
      throw new Error(
        `CSV row ${order + 2}: fill answers consecutively from A.`,
      );
    const answers = cells.filter(Boolean);
    const type = get("type") || "multiple-choice";
    const correct = get("correct_answer").toUpperCase();
    const index = /^[A-F]$/.test(correct)
      ? correct.charCodeAt(0) - 65
      : answers.findIndex((a) => a.toUpperCase() === correct);
    return {
      id: crypto.randomUUID(),
      type,
      prompt: get("question"),
      answers,
      correctAnswer: type === "poll" ? null : index,
      timer: Number(get("timer") || 20),
      scoreMode: type === "poll" ? "no-score" : get("score") || "casual",
      explanation: get("explanation"),
      order,
    } as CustomQuestion;
  });
  return validateBoard(board);
}

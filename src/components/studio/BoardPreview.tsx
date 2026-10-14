import { useState } from "react";
import type { CustomBoard, CustomQuestion } from "../../../shared/boards";
import { Icon, Logo, Tag } from "../Visuals";
export function BoardPreview({
  board,
  question,
  reveal = false,
  phone = false,
}: {
  board: CustomBoard;
  question: CustomQuestion;
  reveal?: boolean;
  phone?: boolean;
}) {
  const [pick, setPick] = useState<number | null>(null);
  return (
    <div
      className={phone ? "studio-phone-preview" : "studio-host-preview"}
      style={{ "--board-color": board.coverStyle.color } as React.CSSProperties}
    >
      <header>
        <Logo light={!phone} />
        <span>{phone ? "YOUR CONTROLLER" : "THE BIG SCREEN"}</span>
      </header>
      <div className="studio-preview-body">
        <Tag color="#f6ed51">
          {question.type === "poll"
            ? "ROOM POLL"
            : `${question.timer} SECOND ROUND`}
        </Tag>
        <h3>{question.prompt || "Your next great question goes here."}</h3>
        <div className="studio-preview-answers">
          {question.answers.map((answer, i) =>
            phone ? (
              <button
                key={i}
                className={pick === i ? "preview-picked" : ""}
                onClick={() => setPick(i)}
              >
                <span>{"ABCDEF"[i]}</span>
                <b>{answer || `Answer ${"ABCDEF"[i]}`}</b>
                {pick === i && <Icon name="check" />}
              </button>
            ) : (
              <div
                key={i}
                className={
                  reveal &&
                  board.settings.showCorrectAnswer &&
                  question.correctAnswer === i
                    ? "preview-correct"
                    : ""
                }
              >
                <span>{"ABCDEF"[i]}</span>
                <b>{answer || `Answer ${"ABCDEF"[i]}`}</b>
                {reveal &&
                  board.settings.showCorrectAnswer &&
                  question.correctAnswer === i && <Icon name="check" />}
              </div>
            ),
          )}
        </div>
        {reveal && board.settings.showExplanation && question.explanation && (
          <p>{question.explanation}</p>
        )}
        {phone && pick !== null && (
          <p role="status">
            Preview answer locked. No points are being recorded.
          </p>
        )}
      </div>
      <footer>
        {board.title || "Your question board"}{" "}
        <span>
          {phone ? "Tap an answer to preview." : "Phones out. Game faces on."}
        </span>
      </footer>
    </div>
  );
}

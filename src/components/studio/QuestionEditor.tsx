import type { CustomQuestion } from "../../../shared/boards";
import { TIMER_OPTIONS, questionIssues } from "../../../shared/boards";
export function QuestionEditor({
  question,
  onChange,
  showErrors,
}: {
  question: CustomQuestion;
  onChange: (q: CustomQuestion) => void;
  showErrors: boolean;
}) {
  const q = question,
    issues = showErrors ? questionIssues(q) : [],
    patch = (p: Partial<CustomQuestion>) => onChange({ ...q, ...p });
  const error = (path: string) => issues.find((i) => i.path === path)?.message;
  function move(index: number, dir: number) {
    const target = index + dir;
    if (target < 0 || target >= q.answers.length) return;
    const answers = [...q.answers];
    [answers[index], answers[target]] = [answers[target], answers[index]];
    const correct =
      q.correctAnswer === index
        ? target
        : q.correctAnswer === target
          ? index
          : q.correctAnswer;
    patch({ answers, correctAnswer: correct });
  }
  return (
    <section className="question-editor">
      <div className="question-editor-heading">
        <span className="eyebrow">
          QUESTION {String(q.order + 1).padStart(2, "0")}
        </span>
        <label>
          Question type
          <select
            value={q.type}
            onChange={(e) => {
              const type = e.target.value as CustomQuestion["type"];
              patch({
                type,
                answers: type === "true-false" ? ["True", "False"] : q.answers,
                correctAnswer:
                  type === "poll"
                    ? null
                    : q.correctAnswer !== null &&
                        q.correctAnswer < 2 &&
                        type === "true-false"
                      ? q.correctAnswer
                      : type === "true-false"
                        ? null
                        : q.correctAnswer,
                scoreMode:
                  type === "poll"
                    ? "no-score"
                    : q.scoreMode === "no-score"
                      ? "casual"
                      : q.scoreMode,
              });
            }}
          >
            <option value="multiple-choice">Multiple choice</option>
            <option value="true-false">True / False</option>
            <option value="poll">Room poll</option>
          </select>
        </label>
      </div>
      <label htmlFor="question-prompt">Give the room a question</label>
      <textarea
        id="question-prompt"
        rows={3}
        maxLength={180}
        value={q.prompt}
        onChange={(e) => patch({ prompt: e.target.value })}
        placeholder="Something your people will actually want to answer."
        aria-invalid={!!error("prompt")}
        aria-describedby="question-prompt-error"
      />
      <div className="editor-count">{q.prompt.length} / 180</div>
      {error("prompt") && (
        <p id="question-prompt-error" className="field-error">
          {error("prompt")}
        </p>
      )}
      <div className="answer-editor-heading">
        <h2>
          {q.type === "poll"
            ? "Give them options."
            : "Give them a fighting chance."}
        </h2>
        <p>
          {q.type === "poll"
            ? "Every opinion counts. Polls have no correct answer or points."
            : "Mark one answer correct. Players won’t see it until the reveal."}
        </p>
      </div>
      <div className="answer-editor-cards">
        {q.answers.map((a, i) => (
          <div
            key={i}
            className={`answer-editor-card ${q.correctAnswer === i ? "answer-correct" : ""}`}
          >
            <span className="answer-letter">{"ABCDEF"[i]}</span>
            <div className="answer-editor-field">
              <label htmlFor={`answer-${i}`}>Answer {"ABCDEF"[i]}</label>
              <input
                id={`answer-${i}`}
                value={a}
                readOnly={q.type === "true-false"}
                maxLength={80}
                onChange={(e) =>
                  patch({
                    answers: q.answers.map((text, j) =>
                      j === i ? e.target.value : text,
                    ),
                  })
                }
                placeholder={`Answer ${"ABCDEF"[i]}`}
                aria-invalid={!!error(`answers.${i}`)}
              />
              <span>{a.length} / 80</span>
              {error(`answers.${i}`) && (
                <p className="field-error">{error(`answers.${i}`)}</p>
              )}
            </div>
            <div className="answer-editor-actions">
              {q.type !== "poll" && (
                <label className="correct-toggle">
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correctAnswer === i}
                    aria-label={`Mark answer ${"ABCDEF"[i]} correct`}
                    onChange={() => patch({ correctAnswer: i })}
                  />
                  <span>{q.correctAnswer === i ? "Correct" : "Correct?"}</span>
                </label>
              )}
              {q.type !== "true-false" && (
                <>
                  <div>
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                      aria-label={`Move answer ${"ABCDEF"[i]} up`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={i === q.answers.length - 1}
                      onClick={() => move(i, 1)}
                      aria-label={`Move answer ${"ABCDEF"[i]} down`}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      disabled={q.answers.length <= 2}
                      aria-label={`Remove answer ${"ABCDEF"[i]}`}
                      onClick={() => {
                        patch({
                          answers: q.answers.filter((_, j) => j !== i),
                          correctAnswer:
                            q.correctAnswer === i
                              ? null
                              : q.correctAnswer !== null && q.correctAnswer > i
                                ? q.correctAnswer - 1
                                : q.correctAnswer,
                        });
                      }}
                    >
                      ×
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {error("correctAnswer") && (
        <p className="field-error" role="alert">
          {error("correctAnswer")}
        </p>
      )}
      {error("answers") && <p className="field-error">{error("answers")}</p>}
      {q.type !== "true-false" && (
        <button
          type="button"
          className="button outline full"
          disabled={q.answers.length >= 6}
          onClick={() => patch({ answers: [...q.answers, ""] })}
        >
          Add another answer <span>+</span>
        </button>
      )}
      <div className="question-rules">
        <label>
          Round timer
          <select
            value={q.timer}
            onChange={(e) =>
              patch({
                timer: Number(e.target.value) as CustomQuestion["timer"],
              })
            }
          >
            {TIMER_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} seconds
              </option>
            ))}
          </select>
        </label>
        <label>
          Points
          <select
            disabled={q.type === "poll"}
            value={q.scoreMode}
            onChange={(e) =>
              patch({
                scoreMode: e.target.value as CustomQuestion["scoreMode"],
              })
            }
          >
            <option value="casual">Casual · 500 correct</option>
            <option value="quick-draw">Quick Draw · up to 1,000</option>
            <option value="no-score">Just play · no score</option>
          </select>
        </label>
      </div>
      <label htmlFor="question-explanation">
        The little fact after the reveal <span>(optional)</span>
      </label>
      <textarea
        id="question-explanation"
        maxLength={300}
        rows={3}
        value={q.explanation}
        onChange={(e) => patch({ explanation: e.target.value })}
        placeholder="Explain why. Or give the room something to talk about."
      />
      <div className="editor-count">{q.explanation.length} / 300</div>
    </section>
  );
}

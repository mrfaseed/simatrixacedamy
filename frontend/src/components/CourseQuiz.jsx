import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const SAMPLE_QUESTIONS = [
  {
    question: "What is the best first step when starting a new technical project?",
    options: ["Skip the requirements", "Understand the requirements", "Write code immediately", "Deploy immediately"],
    answer: 1,
  },
  {
    question: "Which practice makes code easier to maintain?",
    options: ["Meaningful names", "One huge function", "Duplicated logic", "No documentation"],
    answer: 0,
  },
  {
    question: "What does debugging mean?",
    options: ["Deleting the project", "Finding and fixing problems", "Changing the font", "Buying a server"],
    answer: 1,
  },
  {
    question: "Why should technical work be tested?",
    options: ["To find defects early", "To make files larger", "To avoid reviewing code", "To remove requirements"],
    answer: 0,
  },
  {
    question: "What is version control mainly used for?",
    options: ["Tracking code changes", "Compressing images", "Designing logos", "Blocking users"],
    answer: 0,
  },
  {
    question: "Which approach is safest for user input?",
    options: ["Trust every value", "Validate and sanitize it", "Ignore empty values", "Store it without checking"],
    answer: 1,
  },
  {
    question: "What is an API commonly used for?",
    options: ["Connecting software systems", "Cleaning a monitor", "Formatting a keyboard", "Replacing a database automatically"],
    answer: 0,
  },
  {
    question: "What does responsive design help with?",
    options: ["Different screen sizes", "Faster typing", "Larger databases", "Password recovery"],
    answer: 0,
  },
  {
    question: "What is a useful way to learn a technical concept?",
    options: ["Only memorize its name", "Build a small practical example", "Avoid asking questions", "Copy without understanding"],
    answer: 1,
  },
  {
    question: "What should you do after completing a feature?",
    options: ["Test it and review the result", "Delete the tests", "Hide errors", "Change unrelated files"],
    answer: 0,
  },
];

const OPTION_LETTERS = ["A", "B", "C", "D"];

export default function CourseQuiz({ courseTitle, questions }) {
  const quizQuestions = questions?.length ? questions : SAMPLE_QUESTIONS;
  const [isOpen, setIsOpen] = useState(false);
  const [quiz, setQuiz] = useState(() => ({
    answers: Array(quizQuestions.length).fill(null),
    score: null,
  }));
  const { answers, score } = quiz;

  const answeredCount = answers.filter((answer) => answer !== null).length;

  useEffect(() => {
    if (!isOpen) return undefined;

    const scrollY = window.scrollY;
    const html = document.documentElement;
    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: document.body.style.overflow,
      bodyPosition: document.body.style.position,
      bodyTop: document.body.style.top,
      bodyWidth: document.body.style.width,
      bodyOverscroll: document.body.style.overscrollBehavior,
    };

    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = previous.htmlOverflow;
      document.body.style.overflow = previous.bodyOverflow;
      document.body.style.position = previous.bodyPosition;
      document.body.style.top = previous.bodyTop;
      document.body.style.width = previous.bodyWidth;
      document.body.style.overscrollBehavior = previous.bodyOverscroll;
      window.scrollTo({ top: scrollY, behavior: "auto" });
    };
  }, [isOpen]);

  const choose = (questionIndex, optionIndex) => {
    if (score !== null) return;
    setQuiz((current) => {
      const next = [...current.answers];
      next[questionIndex] = optionIndex;
      const isComplete = next.length === quizQuestions.length && next.every((answer) => answer !== null);
      const nextScore = isComplete
        ? next.reduce(
            (total, answer, index) =>
              total + (answer === quizQuestions[index].answer ? 1 : 0),
            0
          )
        : null;
      return { answers: next, score: nextScore };
    });
  };

  const reset = () => {
    setQuiz({ answers: Array(quizQuestions.length).fill(null), score: null });
  };

  return (
    <>
      <section id="course-quiz" className="mt-14 text-center">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-xl bg-gradient-to-r from-[#1358E0] to-[#7C3AED] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7C3AED]/20 transition-transform hover:-translate-y-0.5"
        >
          Start Test
        </button>
      </section>

      {isOpen && createPortal((
        <div
          className="fixed inset-0 z-[100] grid touch-none place-items-center overflow-hidden bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-quiz-title"
            className="h-auto max-h-[90dvh] w-full max-w-4xl touch-pan-y overscroll-contain overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl [-webkit-overflow-scrolling:touch] sm:p-8"
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close quiz"
              className="float-right grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
            >
              <i className="ti ti-x text-lg" />
            </button>
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7C3AED]">Practice quiz</p>
          <h2 id="course-quiz-title" className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900">Test your {courseTitle} basics</h2>
          <p className="mt-2 text-sm text-slate-500">Your score appears automatically after you answer all {quizQuestions.length} questions.</p>
        </div>
        <span className="w-fit rounded-full bg-[#7C3AED]/10 px-3 py-1.5 text-xs font-semibold text-[#7C3AED]">
          {answeredCount}/{quizQuestions.length} answered
        </span>
      </div>

      {score === null ? (
        <div className="mt-6 space-y-7">
          {quizQuestions.map((item, questionIndex) => (
            <fieldset key={item.question} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
              <legend className="text-sm font-semibold leading-relaxed text-slate-800">
                <span className="mr-2 text-[#1358E0]">{questionIndex + 1}.</span>{item.question}
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {item.options.map((option, optionIndex) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${
                      answers[questionIndex] === optionIndex
                        ? "border-[#7C3AED] bg-[#7C3AED]/5 text-slate-900"
                        : "border-slate-200 text-slate-600 hover:border-[#7C3AED]/40 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${questionIndex}`}
                      checked={answers[questionIndex] === optionIndex}
                      onChange={() => choose(questionIndex, optionIndex)}
                      className="mt-0.5 accent-[#7C3AED]"
                    />
                    <span><strong className="mr-1 text-[#7C3AED]">{OPTION_LETTERS[optionIndex]}.</strong>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          <p className="text-center text-xs text-slate-500">
            {quizQuestions.length - answeredCount} questions remaining
          </p>
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7C3AED]">Quiz complete</p>
          <p className="mt-3 font-display text-5xl font-semibold text-slate-900">{score}/{quizQuestions.length}</p>
          <p className="mt-2 text-slate-600">
            {score / quizQuestions.length >= 0.8 ? "Excellent work!" : score / quizQuestions.length >= 0.5 ? "Good start. Review the course topics and try again." : "Keep practicing and try the quiz again."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-xl border border-[#7C3AED]/30 px-5 py-2.5 text-sm font-semibold text-[#7C3AED] transition-colors hover:bg-[#7C3AED]/5"
          >
            Try again
          </button>
        </div>
      )}
          </section>
        </div>
      ), document.body)}
    </>
  );
}

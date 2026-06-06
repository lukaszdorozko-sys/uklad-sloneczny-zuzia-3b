import { useMemo, useState } from 'react';
import { CheckCircle2, HelpCircle, RotateCcw, XCircle } from 'lucide-react';
import { quizQuestions } from '../../data/quizQuestions';
import { useSolarStore } from '../../stores/useSolarStore';
import type { QuizQuestion } from '../../types/celestial';

const QUESTION_COUNT = 10;

interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  correct: boolean;
}

const createQuestionSet = (): QuizQuestion[] =>
  [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, QUESTION_COUNT);

const shuffleOptions = (question: QuizQuestion): string[] =>
  [...question.options].sort(() => Math.random() - 0.5);

export function QuizPanel() {
  const [questions, setQuestions] = useState(() => createQuestionSet());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const recordQuizAnswer = useSolarStore((state) => state.recordQuizAnswer);
  const selectBody = useSolarStore((state) => state.selectBody);

  const question = questions[currentIndex];
  const shuffledOptions = useMemo(() => shuffleOptions(question), [question]);
  const score = answers.filter((answer) => answer.correct).length;
  const finished = answers.length === questions.length;
  const progress = finished ? questions.length : currentIndex + 1;
  const isCorrect = selectedAnswer === question.correctAnswer;

  const checkAnswer = () => {
    if (!selectedAnswer || checked) {
      return;
    }

    const answer = {
      questionId: question.id,
      selectedAnswer,
      correct: isCorrect,
    };

    setChecked(true);
    setAnswers((currentAnswers) => [...currentAnswers, answer]);
    recordQuizAnswer(isCorrect);
  };

  const nextQuestion = () => {
    if (currentIndex === questions.length - 1) {
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelectedAnswer('');
    setChecked(false);
  };

  const restartQuiz = () => {
    setQuestions(createQuestionSet());
    setCurrentIndex(0);
    setSelectedAnswer('');
    setChecked(false);
    setAnswers([]);
  };

  if (finished) {
    const percent = Math.round((score / questions.length) * 100);
    return (
      <section className="dock-panel quiz-panel" aria-label="Wynik quizu edukacyjnego">
        <div className="dock-panel-header">
          <div className="section-heading">
            <HelpCircle aria-hidden="true" size={16} />
            <h2>Quiz zakończony</h2>
          </div>
          <strong>{score}/{questions.length}</strong>
        </div>

        <div className="quiz-result">
          <strong>{percent}% poprawnych odpowiedzi</strong>
          <p>
            {percent >= 80
              ? 'Świetny wynik. Układ Słoneczny zaczyna być Twoim terenem.'
              : percent >= 50
                ? 'Dobry start. Kilka faktów warto jeszcze raz podejrzeć w panelu wiedzy.'
                : 'To była rozgrzewka. Spróbuj jeszcze raz i klikaj obiekty, żeby czytać ciekawostki.'}
          </p>
          <div className="quiz-review">
            {answers.map((answer, index) => {
              const answeredQuestion = questions.find((item) => item.id === answer.questionId);
              if (!answeredQuestion) {
                return null;
              }

              return (
                <div key={answer.questionId}>
                  <span>
                    {index + 1}. {answeredQuestion.question}
                  </span>
                  <strong className={answer.correct ? 'is-correct-text' : 'is-wrong-text'}>
                    {answer.correct ? 'dobrze' : `źle: ${answeredQuestion.correctAnswer}`}
                  </strong>
                </div>
              );
            })}
          </div>
          <button type="button" className="action-button action-button--active" onClick={restartQuiz}>
            <RotateCcw aria-hidden="true" size={16} />
            Zacznij od nowa
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="dock-panel quiz-panel" aria-label="Quiz edukacyjny">
      <div className="dock-panel-header">
        <div className="section-heading">
          <HelpCircle aria-hidden="true" size={16} />
          <h2>Quiz</h2>
        </div>
        <strong>
          {progress}/{questions.length}
        </strong>
      </div>

      <div className="quiz-card">
        <div className="quiz-progress" aria-hidden="true">
          <span style={{ width: `${((currentIndex + (checked ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>
        <p>{question.question}</p>
        <div className="answer-grid">
          {shuffledOptions.map((option) => {
            const optionCorrect = checked && option === question.correctAnswer;
            const optionWrong = checked && option === selectedAnswer && !isCorrect;
            return (
              <button
                type="button"
                key={option}
                className={`${selectedAnswer === option ? 'is-selected' : ''} ${optionCorrect ? 'is-correct' : ''} ${
                  optionWrong ? 'is-wrong' : ''
                }`}
                onClick={() => setSelectedAnswer(option)}
                disabled={checked}
              >
                {optionCorrect ? <CheckCircle2 aria-hidden="true" size={16} /> : null}
                {optionWrong ? <XCircle aria-hidden="true" size={16} /> : null}
                {option}
              </button>
            );
          })}
        </div>

        {checked ? (
          <div className={`quiz-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
            <strong>{isCorrect ? 'Poprawnie' : `Poprawna odpowiedź: ${question.correctAnswer}`}</strong>
            <span>{question.explanation}</span>
          </div>
        ) : null}

        <div className="quiz-actions">
          <button type="button" className="action-button" onClick={checkAnswer} disabled={!selectedAnswer || checked}>
            Sprawdź
          </button>
          <button
            type="button"
            className="action-button action-button--active"
            onClick={nextQuestion}
            disabled={!checked || currentIndex === questions.length - 1}
          >
            Dalej
          </button>
          {question.relatedBodyId ? (
            <button type="button" className="action-button" onClick={() => selectBody(question.relatedBodyId ?? 'earth')}>
              Pokaż obiekt
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

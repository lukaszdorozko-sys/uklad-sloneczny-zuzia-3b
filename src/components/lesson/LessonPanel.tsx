import { useState } from 'react';
import { ArrowLeft, ArrowRight, LocateFixed } from 'lucide-react';
import { lessonSteps } from '../../data/lessonSteps';
import { bodyById } from '../../data/celestialBodies';
import { useSolarStore } from '../../stores/useSolarStore';

export function LessonPanel() {
  const [stepIndex, setStepIndex] = useState(0);
  const selectBody = useSolarStore((state) => state.selectBody);
  const step = lessonSteps[stepIndex];
  const body = step.bodyId ? bodyById[step.bodyId] : null;
  const progress = ((stepIndex + 1) / lessonSteps.length) * 100;

  return (
    <section className="dock-panel lesson-panel" aria-label="Lekcja krok po kroku">
      <div className="lesson-progress">
        <span>{stepIndex + 1}/10</span>
        <div aria-hidden="true">
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="lesson-copy">
        <span className="eyebrow">Lekcja</span>
        <h2>{step.title}</h2>
        <p>{step.body}</p>
        <p>{step.task}</p>
      </div>

      <div className="lesson-actions">
        <button
          type="button"
          className="action-button"
          onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
          disabled={stepIndex === 0}
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Wstecz
        </button>
        {body ? (
          <button type="button" className="action-button action-button--active" onClick={() => selectBody(body.id)}>
            <LocateFixed aria-hidden="true" size={16} />
            Pokaż {body.name}
          </button>
        ) : null}
        <button
          type="button"
          className="action-button"
          onClick={() => setStepIndex((current) => Math.min(lessonSteps.length - 1, current + 1))}
          disabled={stepIndex === lessonSteps.length - 1}
        >
          Dalej
          <ArrowRight aria-hidden="true" size={16} />
        </button>
      </div>
    </section>
  );
}

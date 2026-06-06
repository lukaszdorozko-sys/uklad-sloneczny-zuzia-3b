import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ExternalLink, Info, Orbit, Ruler, Sparkle, Target, X } from 'lucide-react';
import { bodyById } from '../../data/celestialBodies';
import { useSolarStore } from '../../stores/useSolarStore';
import {
  formatDays,
  formatExactKm,
  formatGravity,
  formatHours,
  formatMass,
  formatMoons,
  formatTemperature,
  formatVelocity,
} from '../../utils/formatters';
import { IconButton } from './IconButton';

const typeLabels = {
  star: 'Gwiazda',
  planet: 'Planeta',
  moon: 'Księżyc',
};

export function EducationPanel() {
  const selectedBodyId = useSolarStore((state) => state.selectedBodyId);
  const followBodyId = useSolarStore((state) => state.followBodyId);
  const setFollowBody = useSolarStore((state) => state.setFollowBody);
  const stopFollowing = useSolarStore((state) => state.stopFollowing);
  const clearSelection = useSolarStore((state) => state.clearSelection);
  const markFunFactDiscovered = useSolarStore((state) => state.markFunFactDiscovered);

  const body = selectedBodyId ? bodyById[selectedBodyId] : null;

  useEffect(() => {
    if (body) {
      markFunFactDiscovered(body.id);
    }
  }, [body, markFunFactDiscovered]);

  if (!body) {
    return null;
  }

  const distanceLabel =
    body.type === 'moon' ? `orbita: ${formatExactKm(body.orbitRadiusKm)}` : formatExactKm(body.distanceFromSunKm);

  const facts = [
    ['Średnica', formatExactKm(body.diameterKm)],
    ['Masa', formatMass(body.massKg)],
    ['Temperatura', formatTemperature(body.averageTemperatureC)],
    ['Księżyce', formatMoons(body.moonCount)],
    ['Grawitacja', formatGravity(body.gravityMs2)],
    ['Odległość', distanceLabel],
    ['Długość dnia', formatHours(body.dayLengthHours)],
    ['Długość roku', formatDays(body.yearLengthDays)],
    ['Nachylenie osi', `${body.axialTiltDeg.toLocaleString('pl-PL')}°`],
    ['Prędkość orbitalna', formatVelocity(body.orbitalVelocityKms)],
  ];

  return (
    <motion.aside
      className="education-panel"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.24 }}
      aria-label={`Panel wiedzy: ${body.name}`}
    >
      <div className="panel-header">
        <div>
          <span className="eyebrow">{typeLabels[body.type]}</span>
          <h1>{body.name}</h1>
        </div>
        <IconButton label="Zamknij panel wiedzy" onClick={clearSelection}>
          <X aria-hidden="true" size={18} />
        </IconButton>
      </div>

      <p className="body-description">{body.shortDescription}</p>

      <div className="panel-actions">
        {followBodyId === body.id ? (
          <button type="button" className="action-button action-button--active" onClick={stopFollowing}>
            <X aria-hidden="true" size={16} />
            Zatrzymaj śledzenie
          </button>
        ) : (
          <button type="button" className="action-button" onClick={() => setFollowBody(body.id)}>
            <Target aria-hidden="true" size={16} />
            Śledź obiekt
          </button>
        )}
      </div>

      <div className="fact-grid">
        {facts.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <section className="mini-section">
        <div className="section-heading">
          <Sparkle aria-hidden="true" size={16} />
          <h2>Ciekawostka</h2>
        </div>
        <p>{body.funFact}</p>
      </section>

      <section className="mini-section">
        <div className="section-heading">
          <Orbit aria-hidden="true" size={16} />
          <h2>Atmosfera</h2>
        </div>
        <div className="chips">
          {body.atmosphere.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="mini-section">
        <div className="section-heading">
          <BookOpen aria-hidden="true" size={16} />
          <h2>Źródła</h2>
        </div>
        <div className="source-links">
          {body.sources.map((source) => (
            <a href={source.url} key={source.url} target="_blank" rel="noreferrer">
              <Info aria-hidden="true" size={14} />
              {source.label}
              <ExternalLink aria-hidden="true" size={13} />
            </a>
          ))}
        </div>
      </section>

      <div className="scale-note">
        <Ruler aria-hidden="true" size={15} />
        <span>Dane liczbowe są rzeczywiste; scena używa skalowania wizualnego dla czytelności.</span>
      </div>
    </motion.aside>
  );
}

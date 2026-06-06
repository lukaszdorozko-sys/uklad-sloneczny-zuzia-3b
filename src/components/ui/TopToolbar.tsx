import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Gauge, Info, LocateFixed, Pause, Play, RotateCcw, Scale, Target, X } from 'lucide-react';
import { TIME_SPEEDS } from '../../constants/astronomy';
import { bodyById } from '../../data/celestialBodies';
import { useSolarStore } from '../../stores/useSolarStore';
import type { QualityPreset, ScaleMode, TimeSpeed } from '../../types/celestial';
import { formatSimulatedDate } from '../../utils/formatters';
import { IconButton } from './IconButton';
import { ObjectSearch } from './ObjectSearch';

export function TopToolbar() {
  const [scaleHelpOpen, setScaleHelpOpen] = useState(false);
  const [mobileCompact, setMobileCompact] = useState(false);
  const mobileCompactManuallyChanged = useRef(false);
  const selectedBodyId = useSolarStore((state) => state.selectedBodyId);
  const followBodyId = useSolarStore((state) => state.followBodyId);
  const scaleMode = useSolarStore((state) => state.scaleMode);
  const qualityPreset = useSolarStore((state) => state.qualityPreset);
  const timeSpeed = useSolarStore((state) => state.timeSpeed);
  const simulatedDays = useSolarStore((state) => state.simulatedDays);
  const setScaleMode = useSolarStore((state) => state.setScaleMode);
  const setQualityPreset = useSolarStore((state) => state.setQualityPreset);
  const setTimeSpeed = useSolarStore((state) => state.setTimeSpeed);
  const setFollowBody = useSolarStore((state) => state.setFollowBody);
  const stopFollowing = useSolarStore((state) => state.stopFollowing);
  const goToOverview = useSolarStore((state) => state.goToOverview);

  const selectedBody = selectedBodyId ? bodyById[selectedBodyId] : null;

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 980px)');
    const syncMobileCompact = () => {
      if (!mobileCompactManuallyChanged.current) {
        setMobileCompact(mobileQuery.matches);
      }
    };

    syncMobileCompact();
    mobileQuery.addEventListener('change', syncMobileCompact);
    return () => mobileQuery.removeEventListener('change', syncMobileCompact);
  }, []);

  const toggleMobileCompact = () => {
    mobileCompactManuallyChanged.current = true;
    setMobileCompact((compact) => !compact);
    setScaleHelpOpen(false);
  };

  return (
    <header className={`top-toolbar ${mobileCompact ? 'top-toolbar--mobile-compact' : ''}`}>
      <div className="brand-lockup">
        <div className="brand-mark" aria-hidden="true" />
        <div>
          <strong>Układ Słoneczny 3D</strong>
          <span>{formatSimulatedDate(simulatedDays)}</span>
        </div>
        <IconButton
          label={mobileCompact ? 'Rozwiń panel sterowania' : 'Zwiń panel sterowania'}
          className="mobile-toolbar-toggle"
          aria-expanded={!mobileCompact}
          onClick={toggleMobileCompact}
        >
          {mobileCompact ? <ChevronDown aria-hidden="true" size={19} /> : <ChevronUp aria-hidden="true" size={19} />}
        </IconButton>
      </div>

      <ObjectSearch />

      <div className="toolbar-cluster" role="group" aria-label="Sterowanie czasem">
        {TIME_SPEEDS.map((speed) => (
          <button
            type="button"
            key={speed}
            className={`speed-button ${timeSpeed === speed ? 'speed-button--active' : ''}`}
            onClick={() => setTimeSpeed(speed as TimeSpeed)}
            aria-pressed={timeSpeed === speed}
          >
            {speed === 0 ? <Pause aria-hidden="true" size={15} /> : <Play aria-hidden="true" size={13} />}
            <span>{speed === 0 ? 'Pauza' : `${speed}x`}</span>
          </button>
        ))}
      </div>

      <div className="toolbar-cluster" role="group" aria-label="Tryb skali">
        {(['educational', 'realistic'] as ScaleMode[]).map((mode) => (
          <button
            type="button"
            key={mode}
            className={`scale-button ${scaleMode === mode ? 'scale-button--active' : ''}`}
            onClick={() => setScaleMode(mode)}
            aria-pressed={scaleMode === mode}
          >
            <Scale aria-hidden="true" size={15} />
            <span>{mode === 'educational' ? 'Edukacyjna' : 'Rzeczywista'}</span>
          </button>
        ))}
        <div className="toolbar-popover-wrap">
          <IconButton
            label="Wyjaśnienie trybów skali"
            active={scaleHelpOpen}
            className="icon-button--compact"
            onClick={() => setScaleHelpOpen((open) => !open)}
          >
            <Info aria-hidden="true" size={16} />
          </IconButton>
          {scaleHelpOpen ? (
            <div className="scale-help" role="note">
              <strong>Skala wizualizacji</strong>
              <span>
                Edukacyjna kompresuje odległości i powiększa małe obiekty. Rzeczywista mocniej pokazuje proporcje
                orbit, ale księżyce nadal są powiększone dla czytelności.
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="toolbar-cluster" role="group" aria-label="Jakość grafiki">
        {(['low', 'medium', 'high'] as QualityPreset[]).map((preset) => (
          <button
            type="button"
            key={preset}
            className={`quality-button ${qualityPreset === preset ? 'quality-button--active' : ''}`}
            onClick={() => setQualityPreset(preset)}
            aria-pressed={qualityPreset === preset}
          >
            <Gauge aria-hidden="true" size={15} />
            <span>{preset === 'low' ? 'Niska' : preset === 'medium' ? 'Średnia' : 'Wysoka'}</span>
          </button>
        ))}
      </div>

      <div className="toolbar-icons">
        <IconButton label="Powrót do całego Układu Słonecznego" onClick={goToOverview}>
          <RotateCcw aria-hidden="true" size={18} />
        </IconButton>
        {selectedBody ? (
          followBodyId ? (
            <IconButton label="Zatrzymaj śledzenie" active onClick={stopFollowing}>
              <X aria-hidden="true" size={18} />
            </IconButton>
          ) : (
            <IconButton label={`Śledź obiekt ${selectedBody.name}`} onClick={() => setFollowBody(selectedBody.id)}>
              <Target aria-hidden="true" size={18} />
            </IconButton>
          )
        ) : (
          <IconButton label="Wybierz obiekt, aby śledzić" disabled>
            <LocateFixed aria-hidden="true" size={18} />
          </IconButton>
        )}
      </div>
    </header>
  );
}

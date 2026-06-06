import { BarChart3 } from 'lucide-react';
import { celestialBodies, bodyById } from '../../data/celestialBodies';
import { useSolarStore } from '../../stores/useSolarStore';
import type { CelestialBody } from '../../types/celestial';
import {
  formatDays,
  formatExactKm,
  formatGravity,
  formatHours,
  formatMass,
  formatTemperature,
} from '../../utils/formatters';

interface Metric {
  key: string;
  label: string;
  getValue: (body: CelestialBody) => number;
  format: (value: number) => string;
  scale?: 'linear' | 'log';
}

const metrics: Metric[] = [
  {
    key: 'diameter',
    label: 'Średnica',
    getValue: (body) => body.diameterKm,
    format: formatExactKm,
    scale: 'log',
  },
  {
    key: 'mass',
    label: 'Masa',
    getValue: (body) => body.massKg,
    format: formatMass,
    scale: 'log',
  },
  {
    key: 'temperature',
    label: 'Temperatura',
    getValue: (body) => body.averageTemperatureC,
    format: formatTemperature,
    scale: 'linear',
  },
  {
    key: 'gravity',
    label: 'Grawitacja',
    getValue: (body) => body.gravityMs2,
    format: formatGravity,
    scale: 'linear',
  },
  {
    key: 'year',
    label: 'Rok',
    getValue: (body) => body.yearLengthDays ?? 0,
    format: formatDays,
    scale: 'log',
  },
  {
    key: 'day',
    label: 'Dzień',
    getValue: (body) => body.dayLengthHours ?? 0,
    format: formatHours,
    scale: 'log',
  },
];

const normalizedPercent = (value: number, other: number, scale: Metric['scale']): number => {
  if (value === 0 && other === 0) {
    return 0;
  }

  const safeValue = Math.max(0.0001, Math.abs(value));
  const safeOther = Math.max(0.0001, Math.abs(other));
  const a = scale === 'log' ? Math.log10(safeValue + 1) : safeValue;
  const b = scale === 'log' ? Math.log10(safeOther + 1) : safeOther;
  return Math.max(8, (a / Math.max(a, b)) * 100);
};

export function ComparisonPanel() {
  const comparisonIds = useSolarStore((state) => state.comparisonIds);
  const setComparisonId = useSolarStore((state) => state.setComparisonId);
  const left = bodyById[comparisonIds[0]] ?? bodyById.earth;
  const right = bodyById[comparisonIds[1]] ?? bodyById.mars;

  return (
    <section className="dock-panel" aria-label="Porównywarka planet i księżyców">
      <div className="dock-panel-header">
        <div className="section-heading">
          <BarChart3 aria-hidden="true" size={16} />
          <h2>Porównanie</h2>
        </div>
        <div className="comparison-selects">
          {[0, 1].map((slot) => (
            <select
              key={slot}
              value={comparisonIds[slot as 0 | 1]}
              onChange={(event) => setComparisonId(slot as 0 | 1, event.target.value)}
              aria-label={`Obiekt ${slot + 1} do porównania`}
            >
              {celestialBodies.map((body) => (
                <option key={body.id} value={body.id}>
                  {body.name}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>

      <div className="comparison-grid">
        <table>
          <thead>
            <tr>
              <th>Cecha</th>
              <th>{left.name}</th>
              <th>{right.name}</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.key}>
                <td>{metric.label}</td>
                <td>{metric.format(metric.getValue(left))}</td>
                <td>{metric.format(metric.getValue(right))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="metric-bars">
          {metrics.map((metric) => {
            const leftValue = metric.getValue(left);
            const rightValue = metric.getValue(right);
            return (
              <div className="metric-bar-row" key={metric.key}>
                <span>{metric.label}</span>
                <div className="bars">
                  <i
                    style={{
                      width: `${normalizedPercent(leftValue, rightValue, metric.scale)}%`,
                      backgroundColor: left.themeColor,
                    }}
                  />
                  <i
                    style={{
                      width: `${normalizedPercent(rightValue, leftValue, metric.scale)}%`,
                      backgroundColor: right.themeColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

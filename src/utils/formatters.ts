const compactNumber = new Intl.NumberFormat('pl-PL', {
  notation: 'compact',
  maximumFractionDigits: 2,
});

const decimalNumber = new Intl.NumberFormat('pl-PL', {
  maximumFractionDigits: 2,
});

export const formatKm = (value: number | null): string =>
  value === null ? 'nie dotyczy' : `${compactNumber.format(value)} km`;

export const formatExactKm = (value: number | null): string =>
  value === null ? 'nie dotyczy' : `${new Intl.NumberFormat('pl-PL').format(Math.round(value))} km`;

export const formatMass = (value: number): string => `${value.toExponential(3)} kg`;

export const formatTemperature = (value: number): string => `${decimalNumber.format(value)} °C`;

export const formatGravity = (value: number): string => `${decimalNumber.format(value)} m/s²`;

export const formatVelocity = (value: number): string => `${decimalNumber.format(value)} km/s`;

export const formatHours = (value: number | null): string =>
  value === null ? 'nie dotyczy' : `${decimalNumber.format(value)} h`;

export const formatDays = (value: number | null): string =>
  value === null ? 'nie dotyczy' : `${decimalNumber.format(value)} dni`;

export const formatMoons = (value: number | null): string =>
  value === null ? 'nie dotyczy' : decimalNumber.format(value);

export const formatSimulatedDate = (days: number): string => {
  const years = Math.floor(days / 365.256);
  const remainingDays = Math.floor(days % 365.256);
  return `${years} lat, ${remainingDays} dni`;
};

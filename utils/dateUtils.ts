
export const toISOFromBR = (dateString: string): string => {
  if (!dateString) return new Date().toISOString().split('T')[0];
  const [day, month, year] = dateString.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export const formatISOToBR = (dateISO: string): string => {
  if (!dateISO) return '';
  const [year, month, day] = dateISO.split('-');
  return `${day}/${month}/${year}`;
};

export const getTodayISO = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getYearFromISO = (dateISO: string): number => {
  return new Date(dateISO).getFullYear();
};

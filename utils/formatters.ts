
export const formatTeamName = (team: string): string => {
  return team.toUpperCase();
};

export const pluralize = (count: number, singular: string, plural: string): string => {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
};

export const formatGols = (count: number) => pluralize(count, 'gol', 'gols');
export const formatAssist = (count: number) => pluralize(count, 'assistência', 'assistências');

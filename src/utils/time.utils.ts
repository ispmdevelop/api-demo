export const getEpochTime = (date: string | Date = '') => {
  if (typeof date === 'string' && !date.includes('Z')) {
    date += 'Z';
  }
  return new Date(date).getTime();
};

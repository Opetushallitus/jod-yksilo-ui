export const formatDate = (date: Date) => {
  const month = date.getMonth();
  const fullYear = date.getFullYear();
  return isNaN(month) || isNaN(fullYear) ? '' : `${month + 1}/${fullYear}`;
};

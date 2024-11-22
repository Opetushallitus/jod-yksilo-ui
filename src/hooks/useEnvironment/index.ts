export const useEnvironment = () => {
  const hostname = window.location.hostname;

  return {
    isDev: ['localhost', 'jodkehitys'].some((str) => hostname.includes(str)),
    isTst: hostname.includes('jodtestaus'),
    isPrd: !['localhost', 'jodkehitys', 'jodtestaus'].some((str) => hostname.includes(str)),
  };
};

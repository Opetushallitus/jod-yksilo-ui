type Feature =
  | 'VIRTUAALIOHJAAJA'
  | 'VIRTUAALIOHJAAJA_OSAAMISET'
  | 'JAKOLINKKI'
  | 'TMT_INTEGRATION'
  | 'MAHDOLLISUUDET_HAKU';

//Default to false
const features: Record<Feature, boolean> = {} as Record<Feature, boolean>;

export const loadFeatures = async () => {
  try {
    const loadedFeatures = await fetch(`${import.meta.env.BASE_URL}config/features.json`).then((res) => res.json());
    Object.assign(features, loadedFeatures);
  } catch (error) {
    // It's safe to ignore this error.
    // If feature loading fails, the app will continue to work with default disabled features.
    /* eslint-disable-next-line no-console */
    console.warn('Failed to load features, using defaults', error);
  }
};

export const isFeatureEnabled = (feature: Feature): boolean => {
  return features[feature] === true;
};

type Feature = 'VIRTUAALIOHJAAJA' | 'JAKOLINKKI' | 'TMT_INTEGRATION' | 'MAHDOLLISUUDET_HAKU';

//Default to false
const features: Record<Feature, boolean> = {} as Record<Feature, boolean>;

export const loadFeatures = async () => {
  const loadedFeatures = await fetch(`${import.meta.env.BASE_URL}config/features.json`).then((res) => res.json());
  Object.assign(features, loadedFeatures);
};

export const isFeatureEnabled = (feature: Feature): boolean => {
  return features[feature] === true;
};

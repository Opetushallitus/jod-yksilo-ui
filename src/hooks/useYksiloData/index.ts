import { client } from '@/api/client';
import type { components } from '@/api/schema';
import type { LanguageValue } from '@/i18n/config';
import type { GenderValue } from '@/routes/Profile/utils';
import { getCodesetValue } from '@/utils/codes/codes';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface YksiloData {
  tervetuloapolku: boolean;
  syntymavuosi?: number;
  allowSyntymavuosi: boolean;
  allowSukupuoli: boolean;
  sukupuoli: GenderValue | undefined;
  sukupuoliNimi: string;
  kotikunta?: string; // koodi
  kotikuntaNimi: string;
  allowKotikunta: boolean;
  aidinkieli: LanguageValue;
  email?: string;
}

export const useYksiloData = () => {
  const { t, i18n } = useTranslation();
  const [apiData, setApiData] = React.useState<components['schemas']['YksiloDto']>();
  const [kotikuntaNimi, setKotikuntaNimi] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);
  const language = i18n.language as LanguageValue;

  const sukupuoliText = (sukupuoli: GenderValue | undefined) => {
    switch (sukupuoli) {
      case 'MIES':
        return t('introduction.step-2.gender-male');
      case 'NAINEN':
        return t('introduction.step-2.gender-female');
      default:
        return t('introduction.step-2.gender-other');
    }
  };

  const fetchApiData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await client.GET('/api/profiili/yksilo/tiedot-ja-luvat');

      const kunta = data?.kotikunta ? await getCodesetValue('kunta', data.kotikunta, language) : '';
      setKotikuntaNimi(kunta);

      setApiData(data);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  React.useEffect(() => {
    fetchApiData();
  }, [fetchApiData]);

  return {
    data: {
      tervetuloapolku: apiData?.tervetuloapolku || false,
      syntymavuosi: apiData?.syntymavuosi,
      allowSyntymavuosi: true,
      sukupuoli: apiData?.sukupuoli,
      sukupuoliNimi: sukupuoliText(apiData?.sukupuoli),
      allowSukupuoli: true,
      kotikunta: apiData?.kotikunta,
      kotikuntaNimi: kotikuntaNimi || '',
      allowKotikunta: true,
      aidinkieli: language,
      email: apiData?.email,
    } as YksiloData,
    isLoading,
  };
};

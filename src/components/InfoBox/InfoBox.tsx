import { useTranslation } from 'react-i18next';

import { JodInfo } from '@jod/design-system/icons';

interface InfoBoxProps {
  text: string | React.ReactNode;
}
export const InfoBox = ({ text }: InfoBoxProps) => {
  const { t } = useTranslation();

  return (
    <section
      aria-label={t('tooltip.info')}
      className="max-w-xl mb-8 flex items-start gap-4 rounded-md bg-bg-gray-2 py-5 pr-6 pl-4 text-heading-4 text-secondary-1-dark-2"
    >
      <div aria-hidden="true">
        <JodInfo />
      </div>
      <div>{text}</div>
    </section>
  );
};

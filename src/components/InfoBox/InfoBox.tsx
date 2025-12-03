import { JodInfo } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';

interface InfoBoxProps {
  text: string | React.ReactNode;
}
export const InfoBox = ({ text }: InfoBoxProps) => {
  const { t } = useTranslation();

  return (
    <section
      aria-label={t('tooltip.info')}
      className="flex bg-bg-gray-2 rounded-md max-w-xl py-5 pl-4 pr-6 items-start gap-4 text-secondary-1-dark-2 text-heading-4 mb-8"
    >
      <div aria-hidden="true">
        <JodInfo />
      </div>
      <div>{text}</div>
    </section>
  );
};

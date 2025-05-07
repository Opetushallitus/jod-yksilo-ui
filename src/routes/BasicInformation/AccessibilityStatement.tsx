import { Button } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

const AccessibilityStatement = () => {
  const { t } = useTranslation();
  const title = t('accessibility-statement');

  return (
    <>
      <title>{title}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md font-arial text-todo">
        Dignissim suspendisse in est ante. Egestas pretium aenean pharetra magna ac placerat. Quam adipiscing vitae
        proin sagittis. Lectus magna fringilla urna porttitor rhoncus dolor purus non. Neque vitae tempus quam
        pellentesque. Tristique magna sit amet purus. Orci porta non pulvinar neque. Amet est placerat in egestas erat
        imperdiet sed euismod nisi. Quis hendrerit dolor magna eget. Tortor at auctor urna nunc id cursus metus aliquam
        eleifend.
      </p>
      <div className="flex flex-wrap gap-4">
        <Button variant="white" label={`TODO: ${t('more-information')}`} />
      </div>
    </>
  );
};

export default AccessibilityStatement;

import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useActionBar } from '@/hooks/useActionBar';
import { Button } from '@jod/design-system';
import { Title } from '@/components';

const AccessibilityStatement = () => {
  const { t } = useTranslation();
  const actionBar = useActionBar();
  const title = t('accessibility-statement');

  return (
    <>
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md">
        Dignissim suspendisse in est ante. Egestas pretium aenean pharetra magna ac placerat. Quam adipiscing vitae
        proin sagittis. Lectus magna fringilla urna porttitor rhoncus dolor purus non. Neque vitae tempus quam
        pellentesque. Tristique magna sit amet purus. Orci porta non pulvinar neque. Amet est placerat in egestas erat
        imperdiet sed euismod nisi. Quis hendrerit dolor magna eget. Tortor at auctor urna nunc id cursus metus aliquam
        eleifend.
      </p>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label={t('more-information')}
              onClick={() => {
                alert(t('more-information'));
              }}
            />
          </div>,
          actionBar,
        )}
    </>
  );
};

export default AccessibilityStatement;

import { Title } from '@/components';
import { useActionBar } from '@/hooks/useActionBar';
import { Button } from '@jod/design-system';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

const DataSources = () => {
  const { t } = useTranslation();
  const actionBar = useActionBar();
  const title = t('data-sources');

  return (
    <>
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1 font-poppins">{title}</h1>
      <p className="mb-8 text-body-md">
        Feugiat sed lectus vestibulum mattis ullamcorper velit sed ullamcorper morbi. Cras tincidunt lobortis feugiat
        vivamus at augue. Purus non enim praesent elementum facilisis leo vel. Nam aliquam sem et tortor. Ut etiam sit
        amet nisl purus in mollis nunc sed. Donec ultrices tincidunt arcu non sodales neque. Purus faucibus ornare
        suspendisse sed nisi lacus sed viverra tellus. Sit amet tellus cras adipiscing enim eu turpis egestas. Etiam
        tempor orci eu lobortis elementum nibh tellus molestie. Egestas erat imperdiet sed euismod.
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

export default DataSources;

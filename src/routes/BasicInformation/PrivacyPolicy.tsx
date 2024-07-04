import { Title } from '@/components';
import { useActionBar } from '@/hooks/useActionBar';
import { Button } from '@jod/design-system';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const actionBar = useActionBar();
  const title = t('privacy-policy');

  return (
    <>
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1 font-poppins">{title}</h1>
      <p className="mb-8 text-body-md">
        Tempor nec feugiat nisl pretium fusce id velit. Fringilla ut morbi tincidunt augue interdum velit. Porta lorem
        mollis aliquam ut porttitor leo a diam. Imperdiet massa tincidunt nunc pulvinar. Adipiscing enim eu turpis
        egestas pretium aenean pharetra magna ac. Pellentesque id nibh tortor id. Dui accumsan sit amet nulla facilisi
        morbi tempus iaculis. Blandit libero volutpat sed cras ornare. Euismod quis viverra nibh cras pulvinar mattis
        nunc sed blandit. Nulla facilisi morbi tempus iaculis urna id volutpat lacus laoreet. Viverra maecenas accumsan
        lacus vel facilisis volutpat est. Pulvinar sapien et ligula ullamcorper malesuada proin. Quisque id diam vel
        quam elementum pulvinar etiam. Et pharetra pharetra massa massa. Vel orci porta non pulvinar. Adipiscing elit
        pellentesque habitant morbi tristique senectus et. Penatibus et magnis dis parturient montes nascetur ridiculus
        mus. Duis ultricies lacus sed turpis tincidunt id. At elementum eu facilisis sed odio.
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

export default PrivacyPolicy;

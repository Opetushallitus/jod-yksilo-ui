import { Button } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const title = t('privacy-policy');

  return (
    <>
      <title>{title}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md font-arial text-todo">
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
      <div className="flex flex-wrap gap-4">
        <Button variant="white" label={`TODO: ${t('more-information')}`} />
      </div>
    </>
  );
};

export default PrivacyPolicy;

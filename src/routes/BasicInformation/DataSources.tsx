import { Button } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

const DataSources = () => {
  const { t } = useTranslation();
  const title = t('data-sources');

  return (
    <>
      <title>{title}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md font-arial text-todo">
        Feugiat sed lectus vestibulum mattis ullamcorper velit sed ullamcorper morbi. Cras tincidunt lobortis feugiat
        vivamus at augue. Purus non enim praesent elementum facilisis leo vel. Nam aliquam sem et tortor. Ut etiam sit
        amet nisl purus in mollis nunc sed. Donec ultrices tincidunt arcu non sodales neque. Purus faucibus ornare
        suspendisse sed nisi lacus sed viverra tellus. Sit amet tellus cras adipiscing enim eu turpis egestas. Etiam
        tempor orci eu lobortis elementum nibh tellus molestie. Egestas erat imperdiet sed euismod.
      </p>
      <div className="flex flex-wrap gap-4">
        <Button variant="white" label={`TODO: ${t('more-information')}`} />
      </div>
    </>
  );
};

export default DataSources;

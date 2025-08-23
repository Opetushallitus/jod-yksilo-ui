import { useTranslation } from 'react-i18next';

const WhatIsTheService = () => {
  const { t } = useTranslation();
  const title = t('what-is-the-service');

  return (
    <>
      <title>{title}</title>
      <h1 data-testid="what-is-the-service-title" className="mb-5 text-heading-2 sm:text-heading-1">
        {title}
      </h1>
      <p className="mb-8 text-body-md font-arial text-todo">
        Non curabitur gravida arcu ac tortor dignissim. Eget lorem dolor sed viverra ipsum. Nibh mauris cursus mattis
        molestie a iaculis at erat pellentesque. Sagittis orci a scelerisque purus. Consequat nisl vel pretium lectus
        quam id leo in. Id faucibus nisl tincidunt eget nullam non nisi. Nullam vehicula ipsum a arcu cursus. Arcu ac
        tortor dignissim convallis aenean et. Pellentesque pulvinar pellentesque habitant morbi tristique. Pharetra et
        ultrices neque ornare aenean euismod elementum nisi.
      </p>
    </>
  );
};

export default WhatIsTheService;

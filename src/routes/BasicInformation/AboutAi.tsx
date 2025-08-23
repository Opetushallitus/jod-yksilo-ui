import { useTranslation } from 'react-i18next';

const AboutAi = () => {
  const { t } = useTranslation();
  const title = t('about-ai');

  return (
    <>
      <title>{title}</title>
      <h1 data-testid="about-ai-title" className="mb-5 text-heading-2 sm:text-heading-1">
        {title}
      </h1>
      <p className="mb-8 text-body-md font-arial text-todo">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Integer vehicula risus et dignissim
        ultricies. Proin ut eros sit amet quam pulvinar consequat nec sit amet mauris. Phasellus at turpis quis ligula
        convallis scelerisque.
      </p>
    </>
  );
};

export default AboutAi;

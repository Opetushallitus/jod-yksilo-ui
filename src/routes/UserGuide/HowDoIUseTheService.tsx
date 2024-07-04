import { Title } from '@/components';
import { useTranslation } from 'react-i18next';

const HowDoIUseTheService = () => {
  const { t } = useTranslation();
  const title = t('how-do-i-use-the-service');

  return (
    <>
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1 font-poppins">{title}</h1>
      <p className="mb-8 text-body-md">
        In mollis nunc sed id semper risus in hendrerit gravida. Curabitur vitae nunc sed velit. Lorem ipsum dolor sit
        amet consectetur adipiscing elit duis tristique. Mattis aliquam faucibus purus in massa tempor. Vitae tortor
        condimentum lacinia quis vel eros donec ac odio. Cursus metus aliquam eleifend mi. Elementum nibh tellus
        molestie nunc non blandit massa enim nec. Purus in massa tempor nec feugiat. Pellentesque eu tincidunt tortor
        aliquam nulla. Pellentesque eu tincidunt tortor aliquam nulla facilisi cras fermentum odio.
      </p>
    </>
  );
};

export default HowDoIUseTheService;

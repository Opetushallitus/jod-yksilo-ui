import { Title } from '@/components';
import { useTranslation } from 'react-i18next';

const HowDoIGiveFeedback = () => {
  const { t } = useTranslation();
  const title = t('how-do-i-give-feedback');

  return (
    <>
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1 font-poppins">{title}</h1>
      <p className="mb-8 text-body-md">
        Mattis aliquam faucibus purus in massa. Suscipit adipiscing bibendum est ultricies. Cursus euismod quis viverra
        nibh cras pulvinar mattis nunc. Consequat mauris nunc congue nisi vitae suscipit tellus mauris. Ut lectus arcu
        bibendum at varius vel pharetra. Pretium viverra suspendisse potenti nullam ac. Tellus cras adipiscing enim eu
        turpis egestas pretium aenean. Tristique senectus et netus et malesuada fames ac turpis egestas. Sagittis id
        consectetur purus ut faucibus. Donec et odio pellentesque diam. Donec et odio pellentesque diam volutpat commodo
        sed egestas egestas. Cursus vitae congue mauris rhoncus aenean vel elit scelerisque mauris. Erat imperdiet sed
        euismod nisi porta lorem mollis aliquam.
      </p>
    </>
  );
};

export default HowDoIGiveFeedback;

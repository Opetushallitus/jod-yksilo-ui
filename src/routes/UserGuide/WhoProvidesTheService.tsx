import { useTranslation } from 'react-i18next';
import { Title } from '@/components';

const WhoProvidesTheService = () => {
  const { t } = useTranslation();
  const title = t('who-provides-the-service');

  return (
    <>
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md">
        Lacus viverra vitae congue eu consequat ac felis. Malesuada pellentesque elit eget gravida cum sociis natoque.
        Tortor vitae purus faucibus ornare suspendisse sed nisi lacus sed. Vulputate dignissim suspendisse in est ante
        in. Sem viverra aliquet eget sit amet tellus. Maecenas ultricies mi eget mauris pharetra et. A condimentum vitae
        sapien pellentesque habitant. Ac tincidunt vitae semper quis lectus nulla at volutpat. Neque vitae tempus quam
        pellentesque nec nam aliquam sem. Urna duis convallis convallis tellus id interdum velit. Pellentesque eu
        tincidunt tortor aliquam nulla.
      </p>
    </>
  );
};

export default WhoProvidesTheService;

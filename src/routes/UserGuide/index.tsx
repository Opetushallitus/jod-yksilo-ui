import { useRoutes, matchPath, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Title, MainLayout, SimpleNavigationList, RoutesNavigationList } from '@/components';

const WhatIsTheService = () => {
  const { t } = useTranslation();
  const title = t('what-is-the-service');

  return (
    <>
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md">
        Non curabitur gravida arcu ac tortor dignissim. Eget lorem dolor sed viverra ipsum. Nibh mauris cursus mattis
        molestie a iaculis at erat pellentesque. Sagittis orci a scelerisque purus. Consequat nisl vel pretium lectus
        quam id leo in. Id faucibus nisl tincidunt eget nullam non nisi. Nullam vehicula ipsum a arcu cursus. Arcu ac
        tortor dignissim convallis aenean et. Pellentesque pulvinar pellentesque habitant morbi tristique. Pharetra et
        ultrices neque ornare aenean euismod elementum nisi.
      </p>
    </>
  );
};

const WhoIsTheServiceFor = () => {
  const { t } = useTranslation();
  const title = t('who-is-the-service-for');

  return (
    <>
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md">
        Feugiat in fermentum posuere urna nec tincidunt praesent. Nunc mi ipsum faucibus vitae aliquet nec ullamcorper.
        Porttitor rhoncus dolor purus non enim praesent. Mattis pellentesque id nibh tortor id aliquet lectus proin
        nibh. Ac tincidunt vitae semper quis. Molestie nunc non blandit massa enim nec dui. Ridiculus mus mauris vitae
        ultricies leo integer malesuada nunc. Amet consectetur adipiscing elit duis tristique sollicitudin. Semper quis
        lectus nulla at volutpat. Neque convallis a cras semper auctor neque vitae tempus. Non diam phasellus vestibulum
        lorem sed risus.
      </p>
    </>
  );
};

const HowDoIUseTheService = () => {
  const { t } = useTranslation();
  const title = t('how-do-i-use-the-service');

  return (
    <>
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
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

const WhereCanIGetMoreHelp = () => {
  const { t } = useTranslation();
  const title = t('where-can-i-get-more-help');

  return (
    <>
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md">
        Laoreet suspendisse interdum consectetur libero id faucibus. Quisque egestas diam in arcu. A cras semper auctor
        neque vitae tempus quam. Nulla facilisi nullam vehicula ipsum a arcu cursus vitae congue. Ac feugiat sed lectus
        vestibulum mattis ullamcorper velit sed ullamcorper. Fringilla est ullamcorper eget nulla facilisi etiam
        dignissim diam. Neque gravida in fermentum et sollicitudin ac orci phasellus egestas. Tristique senectus et
        netus et. Magnis dis parturient montes nascetur ridiculus. Commodo viverra maecenas accumsan lacus. Sed arcu non
        odio euismod lacinia at quis risus sed.
      </p>
    </>
  );
};

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

const HowDoIGiveFeedback = () => {
  const { t } = useTranslation();
  const title = t('how-do-i-give-feedback');

  return (
    <>
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
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

const UserGuide = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const basicInformationPath = `/${i18n.language}/${t('slugs.user-guide')}`;
  const routes = [
    {
      name: t('what-is-the-service'),
      path: t('slugs.what-is-the-service'),
      element: <WhatIsTheService />,
    },
    {
      name: t('who-is-the-service-for'),
      path: t('slugs.who-is-the-service-for'),
      element: <WhoIsTheServiceFor />,
    },
    {
      name: t('how-do-i-use-the-service'),
      path: t('slugs.how-do-i-use-the-service'),
      element: <HowDoIUseTheService />,
    },
    {
      name: t('where-can-i-get-more-help'),
      path: t('slugs.where-can-i-get-more-help'),
      element: <WhereCanIGetMoreHelp />,
    },
    {
      name: t('who-provides-the-service'),
      path: t('slugs.who-provides-the-service'),
      element: <WhoProvidesTheService />,
    },
    {
      name: t('how-do-i-give-feedback'),
      path: t('slugs.how-do-i-give-feedback'),
      element: <HowDoIGiveFeedback />,
    },
  ].map((route) => ({
    ...route,
    active: !!matchPath(`${basicInformationPath}/${route.path}`, pathname),
  }));
  const element = useRoutes(routes);

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t('user-guide')}>
          <RoutesNavigationList routes={routes} />
        </SimpleNavigationList>
      }
    >
      {element}
    </MainLayout>
  );
};

export default UserGuide;

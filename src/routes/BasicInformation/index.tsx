import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useRoutes, matchPath, useLocation } from 'react-router-dom';
import { useActionBar } from '@/hooks/useActionBar';
import { Button } from '@jod/design-system';
import { Title, MainLayout, SimpleNavigationList, RoutesNavigationList } from '@/components';

const removeApproval = 'remove-approval';
const acceptPreferences = 'accept-preferences';
const moreInformation = 'more-information';

const CookiePolicy = () => {
  const { t, i18n } = useTranslation();
  const actionBar = useActionBar();
  const title = t('cookie-policy');
  const updated = new Intl.DateTimeFormat(i18n.language).format(new Date('2024-03-27'));

  return (
    <>
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-5 text-body-sm text-secondary-gray">
        {t('updated')}: {updated}
      </p>
      <p className="mb-8 text-body-lg">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Vulputate mi sit amet mauris commodo quis. Amet mauris commodo quis imperdiet massa tincidunt nunc
        pulvinar sapien. Maecenas volutpat blandit aliquam etiam erat velit scelerisque. Lorem mollis aliquam ut
        porttitor. Massa massa ultricies mi quis hendrerit. Quis ipsum suspendisse ultrices gravida dictum fusce ut
        placerat orci. Gravida in fermentum et sollicitudin ac. Sapien nec sagittis aliquam malesuada bibendum. Quis
        viverra nibh cras pulvinar mattis. At urna condimentum mattis pellentesque id nibh tortor id aliquet. Dictum at
        tempor commodo ullamcorper. Pellentesque massa placerat duis ultricies lacus sed. Quis imperdiet massa tincidunt
        nunc pulvinar sapien.
      </p>
      <h2 className="mb-5 text-heading-4">Eu mi bibendum neque egestas?</h2>
      <p className="mb-8 text-body-md">
        Eu mi bibendum neque egestas congue quisque egestas. Turpis egestas sed tempus urna et. Eleifend donec pretium
        vulputate sapien. Faucibus ornare suspendisse sed nisi lacus. Vel quam elementum pulvinar etiam non quam lacus
        suspendisse. Nunc id cursus metus aliquam. Turpis egestas maecenas pharetra convallis posuere morbi. Diam quis
        enim lobortis scelerisque. Sed faucibus turpis in eu mi bibendum neque. Egestas diam in arcu cursus. Adipiscing
        elit pellentesque habitant morbi tristique senectus et netus et. Dui nunc mattis enim ut tellus elementum
        sagittis vitae. Justo eget magna fermentum iaculis eu non.
      </p>
      <h2 className="mb-5 text-heading-4">Volutpat ac tincidunt vitae semper?</h2>
      <p className="mb-8 text-body-md">
        Volutpat ac tincidunt vitae semper quis lectus nulla. Neque gravida in fermentum et sollicitudin ac orci
        phasellus egestas. Facilisi nullam vehicula ipsum a arcu cursus. Vestibulum mattis ullamcorper velit sed
        ullamcorper morbi. Nunc faucibus a pellentesque sit amet porttitor eget. Eleifend quam adipiscing vitae proin.
        Pellentesque pulvinar pellentesque habitant morbi. Justo laoreet sit amet cursus. Nunc non blandit massa enim.
        Risus quis varius quam quisque. Ut morbi tincidunt augue interdum velit euismod in pellentesque massa. Nunc
        aliquet bibendum enim facilisis gravida neque. Nulla malesuada pellentesque elit eget gravida cum sociis natoque
        penatibus. Sodales ut eu sem integer vitae justo.
      </p>
      <h2 className="mb-5 text-heading-4">Odio facilisis mauris sit amet</h2>
      <p className="mb-8 text-body-md">
        Odio facilisis mauris sit amet. Eu tincidunt tortor aliquam nulla. Amet consectetur adipiscing elit ut aliquam
        purus sit. Diam quam nulla porttitor massa. Interdum posuere lorem ipsum dolor. Id leo in vitae turpis. Et
        magnis dis parturient montes nascetur ridiculus mus mauris vitae. Turpis massa tincidunt dui ut ornare lectus
        sit. Tortor dignissim convallis aenean et tortor at risus. At imperdiet dui accumsan sit amet nulla facilisi.
        Odio eu feugiat pretium nibh ipsum. Massa massa ultricies mi quis hendrerit. At augue eget arcu dictum varius
        duis at consectetur. Velit ut tortor pretium viverra. At lectus urna duis convallis. Nibh sit amet commodo nulla
        facilisi nullam vehicula ipsum. Non enim praesent elementum facilisis. Amet mattis vulputate enim nulla aliquet.
        Condimentum vitae sapien pellentesque habitant morbi tristique.
      </p>
      <h2 className="mb-5 text-heading-4">Nisl suscipit adipiscing bibendum</h2>
      <p className="mb-8 text-body-md">
        Nisl suscipit adipiscing bibendum est ultricies integer. Ac turpis egestas maecenas pharetra. Lorem ipsum dolor
        sit amet consectetur adipiscing elit. In ante metus dictum at tempor commodo ullamcorper a lacus. Tincidunt
        tortor aliquam nulla facilisi. Convallis tellus id interdum velit laoreet. In nulla posuere sollicitudin aliquam
        ultrices sagittis orci a. Pellentesque id nibh tortor id aliquet. Nullam ac tortor vitae purus faucibus ornare.
        Lectus sit amet est placerat in egestas erat imperdiet. Commodo viverra maecenas accumsan lacus vel facilisis
        volutpat est. Ac auctor augue mauris augue neque gravida in fermentum. Faucibus a pellentesque sit amet.
      </p>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label={t(acceptPreferences)}
              onClick={() => {
                alert(t(acceptPreferences));
              }}
            />
            <Button
              variant="white"
              label={t('edit')}
              onClick={() => {
                alert(t('edit'));
              }}
            />
            <Button
              variant="white-delete"
              label={t(removeApproval)}
              onClick={() => {
                alert(t(removeApproval));
              }}
            />
          </div>,
          actionBar,
        )}
    </>
  );
};

const DataSources = () => {
  const { t } = useTranslation();
  const actionBar = useActionBar();
  const title = t('data-sources');

  return (
    <>
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
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
              label={t(moreInformation)}
              onClick={() => {
                alert(t(moreInformation));
              }}
            />
          </div>,
          actionBar,
        )}
    </>
  );
};

const TermsOfService = () => {
  const { t } = useTranslation();
  const actionBar = useActionBar();
  const title = t('terms-of-service');

  return (
    <>
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md">
        Vitae tempus quam pellentesque nec nam aliquam. Turpis cursus in hac habitasse platea dictumst quisque sagittis.
        Et odio pellentesque diam volutpat. Magna ac placerat vestibulum lectus mauris ultrices eros in cursus. Sed
        vulputate mi sit amet mauris commodo quis imperdiet massa. Et netus et malesuada fames ac turpis. Vel fringilla
        est ullamcorper eget. Venenatis tellus in metus vulputate eu. Faucibus nisl tincidunt eget nullam non nisi est
        sit amet. Sed augue lacus viverra vitae congue eu consequat ac. Fermentum dui faucibus in ornare. Cursus in hac
        habitasse platea dictumst quisque sagittis purus sit. Ipsum dolor sit amet consectetur adipiscing elit ut.
        Fermentum dui faucibus in ornare quam. Varius quam quisque id diam vel.
      </p>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label={t('accept')}
              onClick={() => {
                alert(t('accept'));
              }}
            />
            <Button
              variant="white-delete"
              label={t(removeApproval)}
              onClick={() => {
                alert(t(removeApproval));
              }}
            />
          </div>,
          actionBar,
        )}
    </>
  );
};

const AccessibilityStatement = () => {
  const { t } = useTranslation();
  const actionBar = useActionBar();
  const title = t('accessibility-statement');

  return (
    <>
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md">
        Dignissim suspendisse in est ante. Egestas pretium aenean pharetra magna ac placerat. Quam adipiscing vitae
        proin sagittis. Lectus magna fringilla urna porttitor rhoncus dolor purus non. Neque vitae tempus quam
        pellentesque. Tristique magna sit amet purus. Orci porta non pulvinar neque. Amet est placerat in egestas erat
        imperdiet sed euismod nisi. Quis hendrerit dolor magna eget. Tortor at auctor urna nunc id cursus metus aliquam
        eleifend.
      </p>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label={t(moreInformation)}
              onClick={() => {
                alert(t(moreInformation));
              }}
            />
          </div>,
          actionBar,
        )}
    </>
  );
};

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const actionBar = useActionBar();
  const title = t('privacy-policy');

  return (
    <>
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
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
              label={t(moreInformation)}
              onClick={() => {
                alert(t(moreInformation));
              }}
            />
          </div>,
          actionBar,
        )}
    </>
  );
};

const BasicInformation = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const basicInformationPath = `/${i18n.language}/${t('slugs.basic-information')}`;
  const routes = [
    {
      name: t('cookie-policy'),
      path: t('slugs.cookie-policy'),
      element: <CookiePolicy />,
    },
    {
      name: t('data-sources'),
      path: t('slugs.data-sources'),
      element: <DataSources />,
    },
    {
      name: t('terms-of-service'),
      path: t('slugs.terms-of-service'),
      element: <TermsOfService />,
    },
    {
      name: t('accessibility-statement'),
      path: t('slugs.accessibility-statement'),
      element: <AccessibilityStatement />,
    },
    {
      name: t('privacy-policy'),
      path: t('slugs.privacy-policy'),
      element: <PrivacyPolicy />,
    },
  ].map((route) => ({
    ...route,
    active: !!matchPath(`${basicInformationPath}/${route.path}`, pathname),
  }));
  const element = useRoutes(routes);

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t('basic-information-about-the-service')}>
          <RoutesNavigationList routes={routes} />
        </SimpleNavigationList>
      }
    >
      {element}
    </MainLayout>
  );
};

export default BasicInformation;

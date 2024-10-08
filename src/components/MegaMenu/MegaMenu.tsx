import { LanguageButton, LanguageMenu, RoutesNavigationList, SimpleNavigationList, UserButton } from '@/components';
import { NavigationBarProps } from '@/components/NavigationBar/NavigationBar';
import { useAppRoutes } from '@/hooks/useAppRoutes';
import { useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose, MdKeyboardBackspace, MdOutlineCancel } from 'react-icons/md';
export { LanguageButton, UserButton } from '@/components';

type MegaMenuProps = {
  loggedIn: boolean;
  onClose: () => void;
  onLanguageClick: () => void;
  logout: () => void;
} & Pick<NavigationBarProps, 'user'>;

export const MegaMenu = ({ loggedIn, onClose, onLanguageClick, user, logout }: MegaMenuProps) => {
  const { sm } = useMediaQueries();
  const { t } = useTranslation();
  const [megaMenuState, setMegaMenuState] = React.useState<'main' | 'lang'>('main');

  const onLanguageButtonClick = () => {
    setMegaMenuState('lang');
  };

  const doClose = () => {
    setMegaMenuState('main');
    onClose();
  };

  const { profileRoutes, toolRoutes, userGuideRoutes } = useAppRoutes();
  const prefixRoutePath = (prefix: string) => (route: { name: string; path: string }) => ({
    ...route,
    path: `${prefix}/${route.path}`,
  });

  const profileIndexPath = t('slugs.profile.index');
  const profileMenuRoutes = profileRoutes.map((route) => ({
    ...prefixRoutePath(profileIndexPath)(route),
    authRequired: true,
  }));
  const toolMenuRoutes = toolRoutes.map(prefixRoutePath(t('slugs.tool.index')));
  const userGuideMenuRoutes = userGuideRoutes.map(prefixRoutePath(t('slugs.user-guide.index')));

  return (
    <div className="fixed top-0 sm:top-11 left-0 right-0 m-auto max-w-[1092px] bg-white shadow-border rounded-b-lg overflow-hidden">
      <ul className="flex flex-row justify-end items-center pr-5 pt-5">
        {!sm && megaMenuState === 'main' && (
          <>
            <li>
              <LanguageButton onClick={onLanguageButtonClick} />
            </li>
            <li className="ml-3">
              <UserButton user={user} />
            </li>
          </>
        )}
        {megaMenuState === 'main' && (
          <li>
            <button onClick={doClose} className="flex items-center ml-5">
              <span
                aria-hidden
                className={`text-black sm:text-secondary-gray flex select-none items-center justify-center self-center rounded-full`}
              >
                {sm ? <MdOutlineCancel size={32} /> : <MdClose size={32} />}
              </span>
            </button>
          </li>
        )}
      </ul>

      <div className="overflow-y-auto max-h-[calc(100vh-172px)] sm:max-h-[calc(100vh-56px)] overscroll-contain">
        <div className="px-5 sm:px-10 pb-7 grid grid-cols-1 sm:grid-cols-3 sm:gap-8">
          {(megaMenuState === 'main' || sm) && (
            <>
              <SimpleNavigationList title={t('user-guide')} backgroundClassName="bg-white" collapsible={!sm}>
                <RoutesNavigationList routes={userGuideMenuRoutes} onClick={onClose} />
              </SimpleNavigationList>
              <SimpleNavigationList title={t('match-service')} backgroundClassName="bg-white" collapsible={!sm}>
                <RoutesNavigationList routes={toolMenuRoutes} onClick={onClose} />
              </SimpleNavigationList>
              <SimpleNavigationList title={t('profile.index')} backgroundClassName="bg-white" collapsible={!sm}>
                <RoutesNavigationList routes={profileMenuRoutes} onClick={onClose} />
              </SimpleNavigationList>
            </>
          )}
          {megaMenuState === 'lang' && !sm && (
            <>
              <button type="button" className="flex select-none mb-8" onClick={() => setMegaMenuState('main')}>
                <MdKeyboardBackspace size={32} />
              </button>
              <LanguageMenu onClick={onLanguageClick} inline />
            </>
          )}
        </div>
        {sm && (
          <div className="flex items-center font-arial sticky bottom-0 bg-[#F5F5F5] h-[100px] px-9 py-6 text-secondary-gray text-body-sm text-todo">
            Lorem ipsum dolor sit amet, soleat iracundia eos ea, est in modo vivendo moderatius. Ex duo hinc graeco
            evertitur, nisl affert vel cu. Ne ius quis repudiare. Ne modo eius corpora mea. Ipsum congue definitiones
            sed in, an sit unum splendide.
          </div>
        )}
        {megaMenuState === 'main' && !sm && loggedIn && (
          <button
            type="button"
            className="font-arial sticky bottom-0 p-6 bg-white w-full text-right text-body-md text-accent hover:underline"
            onClick={logout}
          >
            {t('logout')}
          </button>
        )}
      </div>
    </div>
  );
};

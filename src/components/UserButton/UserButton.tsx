import { components } from '@/api/schema';
import { useMenuClickHandler } from '@/hooks/useMenuClickHandler';
import { PopupList, PopupListItem, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlinePerson } from 'react-icons/md';
import { Link, NavLink, useLoaderData } from 'react-router';

interface UserButtonProps {
  onLogout: () => void;
  onClick?: () => void;
}

export const UserButton = ({ onLogout, onClick }: UserButtonProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const { sm } = useMediaQueries();
  const data = useLoaderData() as components['schemas']['YksiloCsrfDto'] | null;

  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userMenuButtonRef = React.useRef<HTMLButtonElement>(null);
  const userMenuRef = useMenuClickHandler(() => setUserMenuOpen(false), userMenuButtonRef);

  const userMenuProfileFrontUrl = `${t('slugs.profile.index')}/${t('slugs.profile.front')}`;

  // Highlight menu element when active
  const getActiveClassNames = ({ isActive }: { isActive: boolean }) => (isActive ? 'bg-secondary-1-50 rounded-sm' : '');

  const landingPageUrl = `/${language}/${t('slugs.profile.login')}`;
  const fullName = `${data?.etunimi} ${data?.sukunimi}`;
  const initials = !!data?.etunimi && !!data?.sukunimi ? data.etunimi[0] + data.sukunimi[0] : '';

  const elementBasedOnScreenSize = sm ? (
    <div className="relative">
      <button
        ref={userMenuButtonRef}
        type="button"
        className={`cursor-pointer h-8 w-8 rounded-full bg-secondary-3 bg-cover bg-center`}
        onClick={sm ? () => setUserMenuOpen(!userMenuOpen) : void 0}
        aria-label={fullName}
      >
        {initials}
      </button>
      {sm && userMenuOpen && (
        <div ref={userMenuRef} className="absolute right-0 min-w-max translate-y-8 transform">
          <PopupList classNames="gap-2">
            <NavLink
              to={userMenuProfileFrontUrl}
              onClick={() => setUserMenuOpen(false)}
              className={(props) => `w-full ${getActiveClassNames(props)}`.trim()}
            >
              <PopupListItem>{t('profile.index')}</PopupListItem>
            </NavLink>
            <button type="button" onClick={onLogout} className="cursor-pointer w-full">
              <PopupListItem classNames="w-full">{t('logout')}</PopupListItem>
            </button>
          </PopupList>
        </div>
      )}
    </div>
  ) : (
    <span
      role="note"
      className={`flex justify-center content-center flex-wrap h-8 w-8 rounded-full bg-secondary-3 bg-cover bg-center`}
      aria-label={fullName}
    >
      {initials}
    </span>
  );

  return data?.csrf ? (
    elementBasedOnScreenSize
  ) : (
    <Link
      to={landingPageUrl}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-gray-2"
      aria-label={t('login')}
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
    >
      <MdOutlinePerson size={24} />
    </Link>
  );
};

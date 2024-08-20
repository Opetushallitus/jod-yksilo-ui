import { NavigationBarProps } from '@/components/NavigationBar/NavigationBar';
import { useTranslation } from 'react-i18next';
import { MdOutlinePerson } from 'react-icons/md';

export const UserButton = ({ user }: Pick<NavigationBarProps, 'user'>) => {
  const { i18n } = useTranslation();
  const initials = user?.name
    .split(' ')
    .map((part) => part[0])
    .splice(0, 2)
    .join('')
    .toUpperCase();

  const login = { url: `/login?lang=${i18n.language}`, text: 'Login' };

  return user ? (
    <user.component
      className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-3 text-white"
      role="img"
      title={user.name}
    >
      {initials}
    </user.component>
  ) : (
    <a href={login.url} className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-gray-2">
      <MdOutlinePerson size={24} />
    </a>
  );
};

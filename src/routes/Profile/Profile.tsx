import { Outlet } from 'react-router';

import { useAppRoutes } from '@/hooks/useAppRoutes';

const Profile = () => {
  const { profileRoutes } = useAppRoutes();
  return <Outlet context={profileRoutes} />;
};

export default Profile;

import { useAppRoutes } from '@/hooks/useAppRoutes';
import { Outlet } from 'react-router';

const Profile = () => {
  const { profileRoutes } = useAppRoutes();
  return <Outlet context={profileRoutes} />;
};

export default Profile;

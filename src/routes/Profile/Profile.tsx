import useProfileRoutes from '@/routeDefinitions/profileRoutes';
import { Outlet } from 'react-router-dom';

const Profile = () => {
  const { profileRoutes } = useProfileRoutes();
  return <Outlet context={profileRoutes} />;
};

export default Profile;

import { profileRoutes } from '@/routeDefinitions/profileRoutes';
import { Outlet } from 'react-router-dom';

const Profile = () => {
  return <Outlet context={profileRoutes} />;
};

export default Profile;

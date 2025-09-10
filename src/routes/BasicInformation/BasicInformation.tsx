import { Outlet } from 'react-router';

const BasicInformation = () => {
  return (
    <div data-testid="basic-information-content">
      <Outlet />
    </div>
  );
};

export default BasicInformation;

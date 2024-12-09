import { Outlet, useLoaderData } from 'react-router';

const EducationOpportunity = () => {
  const loaderData = useLoaderData();

  return <Outlet context={loaderData} />;
};

export default EducationOpportunity;

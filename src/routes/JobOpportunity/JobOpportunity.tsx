import { Outlet, useLoaderData } from 'react-router-dom';

const JobOpportunity = () => {
  const loaderData = useLoaderData();

  return <Outlet context={loaderData} />;
};

export default JobOpportunity;

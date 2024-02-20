import { Helmet } from 'react-helmet-async';

interface TitleProps {
  value: string;
}

export const Title = ({ value }: TitleProps) => {
  return (
    <Helmet>
      <title>{`${value} - JOD`}</title>
    </Helmet>
  );
};

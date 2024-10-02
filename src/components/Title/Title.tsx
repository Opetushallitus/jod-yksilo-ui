import { Helmet } from 'react-helmet-async';

interface TitleProps {
  value: string;
}

export const Title = ({ value }: TitleProps) => (
  <Helmet>
    <title>{value}</title>
  </Helmet>
);

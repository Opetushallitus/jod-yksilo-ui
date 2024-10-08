import { RoundLinkButton, useMediaQueries } from '@jod/design-system';
import { Link, useMatch } from 'react-router-dom';

const MatchedLink = ({ link }: { link: { to: string; replace: boolean; text: string; icon: React.ReactNode } }) => {
  const { sm } = useMediaQueries();
  const match = useMatch(link.to);
  const selected = match?.pathname == link.to;
  return (
    <RoundLinkButton
      label={link.text}
      icon={link.icon}
      selected={selected}
      hideLabel={!selected && !sm}
      component={({ ...rootProps }) => <Link to={link.to} replace={link.replace} {...rootProps}></Link>}
    />
  );
};

export default MatchedLink;

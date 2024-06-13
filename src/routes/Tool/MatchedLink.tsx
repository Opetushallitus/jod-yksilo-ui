import { RoundLinkButton } from '@jod/design-system';
import { Link, useMatch } from 'react-router-dom';

const MatchedLink = ({ link }: { link: { to: string; text: string; icon: string } }) => {
  const match = useMatch(link.to);
  const selected = match?.pathname == link.to;
  return (
    <RoundLinkButton
      label={link.text}
      icon={link.icon}
      selected={selected}
      component={({ ...rootProps }) => <Link to={link.to} {...rootProps}></Link>}
    />
  );
};

export default MatchedLink;

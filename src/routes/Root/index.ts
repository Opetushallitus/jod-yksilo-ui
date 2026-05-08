import React from 'react';

import ErrorBoundary from './ErrorBoundary';
import loader from './loader';
import NoMatch from './NoMatch';
import Root from './Root';

const LogoutFormContext = React.createContext<React.RefObject<HTMLFormElement | null> | null>(null);

export { ErrorBoundary, LogoutFormContext, NoMatch, Root, loader };

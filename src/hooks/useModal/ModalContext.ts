import React from 'react';

import type { ModalContextType } from '@/hooks/useModal/utils';

export const ModalContext = React.createContext<ModalContextType | undefined>(undefined);

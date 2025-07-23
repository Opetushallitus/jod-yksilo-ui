import type { ModalContextType } from '@/hooks/useModal/utils';
import React from 'react';

export const ModalContext = React.createContext<ModalContextType | undefined>(undefined);

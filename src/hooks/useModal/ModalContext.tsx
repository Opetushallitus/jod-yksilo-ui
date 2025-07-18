import type { ModalContextType } from '@/hooks/useModal/types';
import React from 'react';

export const ModalContext = React.createContext<ModalContextType | undefined>(undefined);

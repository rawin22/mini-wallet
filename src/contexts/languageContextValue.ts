import { createContext } from 'react';
import type { LanguageContextType } from '../types/language.types.ts';

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

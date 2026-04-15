import { useContext } from 'react';
import { ScrollProgressContext } from './ScrollProgressProvider';
import type { ScrollState } from '../types';

export function useScrollProgress(): ScrollState {
  const { state } = useContext(ScrollProgressContext);
  return state;
}

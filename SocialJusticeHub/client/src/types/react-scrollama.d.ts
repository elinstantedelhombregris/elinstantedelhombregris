declare module 'react-scrollama' {
  import { ReactNode, FC } from 'react';

  interface StepProps {
    data?: any;
    children: ReactNode;
  }

  interface ScrollamaProps {
    offset?: number;
    threshold?: number;
    onStepEnter?: (response: { data: any; entry: IntersectionObserverEntry; direction: string }) => void;
    onStepExit?: (response: { data: any; entry: IntersectionObserverEntry; direction: string }) => void;
    onStepProgress?: (response: { data: any; progress: number; entry: IntersectionObserverEntry }) => void;
    children: ReactNode;
  }

  export const Scrollama: FC<ScrollamaProps>;
  export const Step: FC<StepProps>;
}

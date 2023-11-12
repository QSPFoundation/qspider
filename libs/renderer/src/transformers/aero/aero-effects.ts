import { UseTransitionProps } from '@react-spring/web';

export const AERO_EFFECTS: Record<string, UseTransitionProps> = {
  fade: {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  },
};

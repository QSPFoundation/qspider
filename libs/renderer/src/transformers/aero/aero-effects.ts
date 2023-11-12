import { UseTransitionProps } from '@react-spring/web';

export const AERO_EFFECTS: Record<string, UseTransitionProps> = {
  fade: {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  },
  blur: {
    from: { opacity: 0, filter: 'blur(15px)' },
    enter: { opacity: 1, filter: 'blur(0px)' },
    leave: { opacity: 0, filter: 'blur(15px)' },
  },
  l_slide: {
    from: { transform: 'translate3d(-100%, 0, 0)' },
    enter: { transform: 'translate3d(0%, 0, 0)' },
    leave: { transform: 'translate3d(-100%, 0, 0)' },
  },
  r_slide: {
    from: { transform: 'translate3d(100%, 0, 0)' },
    enter: { transform: 'translate3d(0%, 0, 0)' },
    leave: { transform: 'translate3d(100%, 0, 0)' },
  },
  u_slide: {
    from: { transform: 'translate3d(0, 100%, 0)' },
    enter: { transform: 'translate3d(0, 0%, 0)' },
    leave: { transform: 'translate3d(0, 100%, 0)' },
  },
  d_slide: {
    from: { transform: 'translate3d(0, -100%, 0)' },
    enter: { transform: 'translate3d(0, 0%, 0)' },
    leave: { transform: 'translate3d(0, -100%, 0)' },
  },
  iris: {
    from: { clipPath: 'circle(0% at center)' },
    enter: { clipPath: 'circle(120% at center)' },
    leave: { clipPath: 'circle(0% at center)' },
  },
  photo: {
    from: { opacity: 0, boxShadow: 'inset 0 0 0 1000px #fff' },
    enter: { opacity: 1, boxShadow: 'inset 0 0 0 0px #fff' },
    leave: { opacity: 0, boxShadow: 'inset 0 0 0 1000px #fff' },
  },
  rotate: {
    from: { transform: 'rotate3d(0, 0, 1, -90deg)', opacity: 0 },
    enter: { transform: 'rotate3d(0, 0, 1, 0deg)', opacity: 1 },
    leave: { transform: 'rotate3d(0, 0, 1, -90deg)', opacity: 0 },
  },
  v_squeeze: {
    from: { transform: 'scale(0, 1.5)', opacity: 0, transformOrigin: 'center' },
    enter: { transform: 'scale(1, 1)', opacity: 1, transformOrigin: 'center' },
    leave: { transform: 'scale(0, 1.5)', opacity: 0, transformOrigin: 'center' },
  },
  h_squeeze: {
    from: { transform: 'scale(1.5, 0)', opacity: 0, transformOrigin: 'center' },
    enter: { transform: 'scale(1, 1)', opacity: 1, transformOrigin: 'center' },
    leave: { transform: 'scale(1.5, 0)', opacity: 0, transformOrigin: 'center' },
  },
  zoom: {
    from: { transform: 'scale(0, 0)', opacity: 0, transformOrigin: 'center' },
    enter: { transform: 'scale(1, 1)', opacity: 1, transformOrigin: 'center' },
    leave: { transform: 'scale(0, 0)', opacity: 0, transformOrigin: 'center' },
  },
  wipe1: {
    from: { clipPath: 'polygon(0 0, 0 0%, 0% 0%, 0% 0)' },
    enter: { clipPath: 'polygon(0 0, 0 100%, 100% 100%, 100% 0)' },
    leave: { clipPath: 'polygon(0 0, 0 0%, 0% 0%, 0% 0)' },
  },
  wipe2: {
    from: { clipPath: 'polygon(100% 0, 100% 0%, 100% 0%, 100% 0)' },
    enter: { clipPath: 'polygon(0% 0, 0% 100%, 100% 100%, 100% 0)' },
    leave: { clipPath: 'polygon(100% 0, 100% 0, 100% 0%, 100% 0)' },
  },
  wipe3: {
    from: { clipPath: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)' },
    enter: { clipPath: 'polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%)' },
    leave: { clipPath: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)' },
  },
  wipe4: {
    from: { clipPath: 'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)' },
    enter: { clipPath: 'polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%)' },
    leave: { clipPath: 'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)' },
  },
  quake: {
    from: { transform: 'translate3d(0px, 0px, 0)', opacity: 0 },
    enter: [
      { transform: 'translate3d(-2px, 3px, 0)', opacity: 0.1 },
      { transform: 'translate3d(4px, -5px, 0)', opacity: 0.2 },
      { transform: 'translate3d(-8px, 6px, 0)', opacity: 0.3 },
      { transform: 'translate3d(8px, -3px, 0)', opacity: 0.4 },
      { transform: 'translate3d(-8px, 6px, 0)', opacity: 0.5 },
      { transform: 'translate3d(8px, -3px, 0)', opacity: 0.6 },
      { transform: 'translate3d(-8px, 6px, 0)', opacity: 0.7 },
      { transform: 'translate3d(4px, -5px, 0)', opacity: 0.8 },
      { transform: 'translate3d(-2px, 3px, 0)', opacity: 0.9 },
    ],
    leave: [
      { transform: 'translate3d(-2px, 3px, 0)', opacity: 0.9 },
      { transform: 'translate3d(4px, -5px, 0)', opacity: 0.8 },
      { transform: 'translate3d(-8px, 6px, 0)', opacity: 0.7 },
      { transform: 'translate3d(8px, -3px, 0)', opacity: 0.6 },
      { transform: 'translate3d(-8px, 6px, 0)', opacity: 0.5 },
      { transform: 'translate3d(8px, -3px, 0)', opacity: 0.4 },
      { transform: 'translate3d(-8px, 6px, 0)', opacity: 0.3 },
      { transform: 'translate3d(4px, -5px, 0)', opacity: 0.2 },
      { transform: 'translate3d(-2px, 3px, 0)', opacity: 0.1 },
    ],
  },
};

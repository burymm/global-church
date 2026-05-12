export const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  || window.matchMedia('(display-mode: minimal-ui)').matches
  || (window.navigator as any).standalone === true;

import React from 'react';

export interface IGlobalStore {
  sysytemColor?: {
    color: string,
    colorShallow: string,
    colorShallower: string,
    colorShallowest: string,
    colorShallowestAlpha: string,
    colorShallowestAlpha2: string,
    colorDeep: string,
    colorDeeper: string,
    colorDeepest: string,
  }
}

export default React.createContext<IGlobalStore | null>(null);

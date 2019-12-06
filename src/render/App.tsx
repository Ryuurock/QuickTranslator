import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { Route, Switch, HashRouter as Router } from 'react-router-dom';
import { TypeToken } from './pages';
import Context, { IGlobalStore } from './store';
import { THEME_COLOR_CHANGE } from '@/common/event';

/**
 * 16进制颜色转rgba
 * @param hex 16进制字符串
 * @param ratio 比率
 */
function HEXToRGBA(hex: string, ratio: number) {
  const hexCharArray = hex.split('');
  const rgba: number[] = [];
  while (hexCharArray.length) {
    const hexStr = hexCharArray.splice(0, 2);
    rgba.push(parseInt(`0x${hexStr.join('')}`, 16) * (hexCharArray.length ? ratio : 1));
  }

  return `rgba(${rgba})`;
}

const defaultColor = '125eedff';

const App: React.FC = () => {
  const [state, setState] = useState<IGlobalStore>({
    sysytemColor: {
      color: HEXToRGBA(defaultColor, 1),
      colorShallow: HEXToRGBA(defaultColor, 1.2),
      colorShallower: HEXToRGBA(defaultColor, 1.4),
      colorShallowest: HEXToRGBA(defaultColor, 1.6),
      colorDeep: HEXToRGBA(defaultColor, 0.9),
      colorDeeper: HEXToRGBA(defaultColor, 0.8),
      colorDeepest: HEXToRGBA(defaultColor, 0.7),
    }
  })

  useEffect(() => {
    ipcRenderer.on(THEME_COLOR_CHANGE, (_, sysytemColor) => {
      setState({ sysytemColor: {
        color: HEXToRGBA(sysytemColor, 1),
        colorShallow: HEXToRGBA(sysytemColor, 1.2),
        colorShallower: HEXToRGBA(sysytemColor, 1.4),
        colorShallowest: HEXToRGBA(sysytemColor, 1.6),
        colorDeep: HEXToRGBA(sysytemColor, 0.9),
        colorDeeper: HEXToRGBA(sysytemColor, 0.8),
        colorDeepest: HEXToRGBA(sysytemColor, 0.7),
      } });
    });
  }, [setState]);

  useEffect(() => {
    ipcRenderer.send('react-did-mounted');
  });

  return (
    <Router>
      <Switch>
        <Context.Provider value={state}>
          <Route path="/" component={TypeToken} />
        </Context.Provider>
      </Switch>
    </Router>
  );
};

export default App;

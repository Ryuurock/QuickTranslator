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

const App: React.FC = () => {
  const [state, setState] = useState<IGlobalStore>({})

  useEffect(() => {
    ipcRenderer.on(THEME_COLOR_CHANGE, (_, sysytemColor) => {
      setState({ sysytemColor: {
        color: HEXToRGBA(sysytemColor, 1),
        colorShallow: HEXToRGBA(sysytemColor, 0.8),
        colorShallower: HEXToRGBA(sysytemColor, 0.6),
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

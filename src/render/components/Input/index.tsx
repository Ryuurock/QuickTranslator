import React, { useContext } from 'react';
import Context from '../../store';

import styles from './styles.scss';

const Input: React.FC<JSX.IntrinsicElements['input']> = ({ type = 'text', className, ...other }) => {

  const globalStore = useContext(Context);

  console.log(globalStore)

  return (
    <div className={`${styles.inputWrapper} ${className}`}>
      <input type={type} className={styles.formInput} {...other} />
      <div className={styles.focusRing} />
    </div>
  );
};

export default Input;

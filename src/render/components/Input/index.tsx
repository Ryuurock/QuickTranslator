import React from 'react';
import styles from './styles.scss';

const Input: React.FC<JSX.IntrinsicElements['input']> = ({ type = 'text', className, ...other }) => (
  <div className={`${styles.inputWrapper} ${className}`}>
    <input type={type} className={styles.formInput} {...other} />
    <div className={styles.focusRing} />
  </div>
);

export default Input;

import React from 'react';
import cls from 'classnames';

import styles from './styles.scss';

const Button: React.FC<JSX.IntrinsicElements['button'] & { isPrimary?: boolean }> = ({
  type = 'button', children, className = '', isPrimary, ...other }) => (

  <button type={type} className={cls(`${styles.button} ${className}`, {
    [styles.primary]: isPrimary
  })} {...other}>{children}</button>
);

export default Button;

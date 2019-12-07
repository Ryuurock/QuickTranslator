import React, { useContext } from 'react';
import cls from 'classnames';
import styled from 'styled-components';
import Context, { IGlobalStore } from '@/render/store';

type ButtonProps = Omit<JSX.IntrinsicElements['button'], 'ref'> & { isPrimary?: boolean };

const MainButton = styled.button<ButtonProps & { themeColor: Required<IGlobalStore>['sysytemColor'] }>`
  background-color: rgb(255, 255, 255);
  outline: none;
  border: 0;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.04) 0px 1px;
  padding: 1px 14px;
  line-height: 19px;
  font-size: 13px;
  color: inherit;

  &:active {
    background-image: -webkit-linear-gradient(top, ${props => props.themeColor.colorShallower} 0%, ${props => props.themeColor.color} 100%);
    color: rgba(255, 255, 255, .9);
  }

  &.primary {
    background-image: -webkit-linear-gradient(top, ${props => props.themeColor.colorShallow} 0%, ${props => props.themeColor.colorDeep} 100%);
    color: rgba(255, 255, 255, .9);

    &:active {
      background-image: -webkit-linear-gradient(top, ${props => props.themeColor.colorShallower} 0%, ${props => props.themeColor.color} 100%);
      color: rgba(255, 255, 255, .9);
    }
  }

  @media (prefers-color-scheme: dark) {
    background: #676a6c;
    border-color: transparent;
  }
`;

const Button: React.FC<ButtonProps> = ({
  type = 'button', children, className = '', isPrimary, ...other
}) => {
  const store = useContext(Context)!;

  return (
    <MainButton themeColor={store.sysytemColor!} isPrimary={isPrimary} type={type} className={cls(className, {
      primary: isPrimary
    })} {...other}>{children}</MainButton>
  )
};

export default Button;

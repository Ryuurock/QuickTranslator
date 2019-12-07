import React, { useContext } from 'react';
import styled from 'styled-components';
import Context, { IGlobalStore } from '../../store';

type InputProps = Omit<JSX.IntrinsicElements['input'], 'ref'>;

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
  line-height: 1;
`;

const InputStyled = styled.input<{ themeColor: Required<IGlobalStore>['sysytemColor'] }>`
  outline: none;
  position: relative;
  z-index: 1;
  border: 1px solid #c1c1c1;
  padding: 4px 3.5px 3px;
  font-size: 13px;
  width: 208px;
  color: inherit;

  &:focus {
    z-index: 2;

    + .focusRing {
      transition: all 250ms ease;
      box-shadow: 0 0 0 3.5px ${props => props.themeColor.colorShallowestAlpha2};
      z-index: 2;
      &::before {
        height: 0;
      }
    }
  }
  @media (prefers-color-scheme: dark) {
    background: rgba(255,255,255,.1);
    border-color: transparent;
  }
  @media (prefers-color-scheme: light) {
    &:focus {
      border-color: ${props => props.themeColor.colorShallowestAlpha};
    }
  }
`;

const FocusRingStyled = styled.div`
  position: absolute;
  left:   0px;
  top:    0px;
  bottom: 0px;
  right:  0px;
  box-shadow: 0 0 0 20px rgba(109,179,253,0);
  border-radius: 1px;
  pointer-events: none;
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    height: 1px;
    background-color: #686a6c;
    width: 100%;
    transform: scale(1, 0.5);
  }
`;

const Input: React.FC<InputProps> = ({ type = 'text', className, ...other }) => {

  const globalStore = useContext(Context)!;

  return (
    <Wrapper className={className}>
      <InputStyled themeColor={globalStore.sysytemColor!} type={type} {...other} />
      <FocusRingStyled className="focusRing" />
    </Wrapper>
  );
};

export default Input;

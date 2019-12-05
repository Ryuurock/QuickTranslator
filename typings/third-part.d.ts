declare module 'react-desktop/macOs' {
  export const TextInput: React.FC<{
    label?: string
    marginBottom?: string,
    placeholder?: string,
    value?: any,
    onChange?: Function,
    width?: any,
  }>;
  export const Button: React.FC<{
    onClick?: Function,
    color?: string,
    type?: 'submit' | 'button'
  } & React.ButtonHTMLAttributes<HTMLButtonElement>>;
  export const Dialog: React.FC<{
    title: string,
    message?: React.ReactElement,
    icon?: React.ReactElement,
    buttons: React.ReactElement[],
  }>;
}

declare module '*.css' {
  const style: {
    [key in string]: string
  };
  export default style;
}

declare module '*.scss' {
  const style: {
    [key in string]: string
  };
  export default style;
}

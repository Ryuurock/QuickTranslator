declare module 'react-desktop/macOs' {
  export const TextInput: React.FC<{
    label: string
    marginBottom?: string,
    placeholder?: string,
  }>;
  export const Button: React.FC<{
    onClick: Function,
    color?: string,
    type?: 'submit' | 'button'
  }>;
  export const Dialog: React.FC<{
    title: string,
    message?: React.ReactElement,
    icon?: React.ReactElement,
    buttons: React.ReactElement[],
  }>;
}

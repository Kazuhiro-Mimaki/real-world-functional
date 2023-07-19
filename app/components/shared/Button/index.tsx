import type { ComponentProps } from 'react';

type Props = ComponentProps<'button'> & { children: string };

export const Button = ({ children, ...props }: Props) => {
  return (
    <button
      className='text-white bg-green-600 hover:bg-green-700 border-green-600 self-end px-5 py-2 rounded'
      {...props}
    >
      {children}
    </button>
  );
};

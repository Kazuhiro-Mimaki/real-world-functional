import type { ComponentProps } from 'react';

type Props = ComponentProps<'textarea'>;

export const Textarea = (props: Props) => {
  return (
    <textarea
      className='rounded-md border focus:outline-none focus:ring-4 focus:ring-opacity-50 appearance-none text-gray-900 bg-gray-50 border-gray-300 focus:border-primary focus:ring-primary-300 px-4 py-2.5'
      {...props}
    />
  );
};

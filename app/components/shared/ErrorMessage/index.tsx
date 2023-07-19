type Props = { children: string };

export const ErrorMessage = ({ children }: Props) => {
  return (
    <p className='text-red-500' role='alert'>
      {children}
    </p>
  );
};

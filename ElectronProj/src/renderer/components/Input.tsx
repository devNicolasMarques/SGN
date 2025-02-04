import React from 'react';

const Input: React.FC<{ type: string; placeholder: string; id: string }> = ({ type, placeholder, id }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      id={id}
    />
  );
};

export default Input;
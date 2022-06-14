import { useState } from 'react';

export const useForm = (initialValues) => {
  const [values, setValues] = useState(initialValues);

  return [
    values,
    (evt) => {
      setValues({ ...values, [evt.target.name]: evt.target.value });
    },
  ];
};
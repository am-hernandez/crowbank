import { useState } from "react";

export const useError = (initialValues) => {
  const [errors, setErrors] = useState(initialValues);

  return [
    errors,
    ({ name, value }) => {
      setErrors({ ...errors, [name]: value });
    },
  ];
};

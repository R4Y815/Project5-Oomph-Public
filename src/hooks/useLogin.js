/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable import/prefer-default-export */
import { useEffect, useState } from 'react';
import { projectAuth } from '../firebase/config.js';
import { useAuthContext } from './useAuthContext.js';

export function useLogin() {
  const [isCancelled, setIsCancelled] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const { dispatch } = useAuthContext();

  const login = async (email, password) => {
    setError(null);
    setIsPending(true);

    try {
      const res = await projectAuth.signInWithEmailAndPassword(email, password);

      // dispatch login action
      dispatch({ type: 'LOGIN', payload: res.user });

      // update state
      if (!isCancelled) {
        setError(null);
        setIsPending(false);
      }
    }
    catch (err) {
      if (!isCancelled) {
        setError(err.message);
        setIsPending(false);
      }
    }
  };

  useEffect(
    () =>
    // return clean-up function
      () => setIsCancelled(true),
    [],
  );

  return { login, isPending, error };
}

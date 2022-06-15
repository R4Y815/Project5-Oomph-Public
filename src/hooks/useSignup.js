/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable import/prefer-default-export */
import { useEffect, useState } from 'react';
import { projectAuth } from '../firebase/config.js';
import { useAuthContext } from './useAuthContext.js';

export const useSignup = () => {
  const [isCancelled, setIsCancelled] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const { dispatch } = useAuthContext();

  const signup = async (email, password, displayName) => {
    setError(null);
    setIsPending(true);

    try {
      // signup user
      const res = await projectAuth.createUserWithEmailAndPassword(email, password);

      if (!res) {
        throw new Error('Could not complete signup');
      }
      // add display name to user
      await res.user.updateProfile({ displayName });

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

  return { error, isPending, signup };
};

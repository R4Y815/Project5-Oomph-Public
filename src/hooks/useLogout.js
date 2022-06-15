/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable import/prefer-default-export */
import { useEffect, useState } from 'react';
import { projectAuth } from '../firebase/config.js';
import { useAuthContext } from './useAuthContext.js';

export function useLogout() {
  const [isCancelled, setIsCancelled] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const { dispatch } = useAuthContext();

  const logout = async () => {
    setError(null);
    setIsPending(true);

    // sign user out
    try {
      await projectAuth.signOut();

      // dispatch logout action
      dispatch({ type: 'LOGOUT' });

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

  return { logout, isPending, error };
}

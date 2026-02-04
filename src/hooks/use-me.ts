import { useEffect, useState } from 'react';
import { User } from '@/types/user';

type MeState =
  | { status: 'idle' | 'loading'; user: null; error: null }
  | { status: 'success'; user: User; error: null }
  | { status: 'error'; user: null; error: string };

export function useMe() {
  const [state, setState] = useState<MeState>({ status: 'loading', user: null, error: null });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me')
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error?.message || 'Unable to load user');
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setState({ status: 'success', user: data.data.user as User, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: 'error', user: null, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

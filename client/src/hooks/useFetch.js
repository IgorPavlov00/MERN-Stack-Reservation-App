import { useCallback, useEffect, useState } from "react";
import { api } from "../api";

// GET `path` whenever it changes; pass null to skip fetching.
const useFetch = (path) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api(path)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [path, nonce]);

  const reFetch = useCallback(() => setNonce((n) => n + 1), []);
  return { data, loading, error, reFetch };
};

export default useFetch;

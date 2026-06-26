import { useEffect } from 'react';

export default function useAs6RuntimeTracer(scope, payload = {}) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.__AS6_RUNTIME_TRACE__ = window.__AS6_RUNTIME_TRACE__ || [];
    window.__AS6_RUNTIME_TRACE__.push({
      scope,
      stage: 'V222_61',
      payload,
      ts: new Date().toISOString(),
    });
  }, [scope]);
}

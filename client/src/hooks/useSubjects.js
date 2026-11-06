// The student's subject list + add / rename / delete. The server returns the full updated list
// after every change, so we simply replace our copy with it.
import { useCallback, useEffect, useState } from 'react';
import * as subjectsApi from '../api/subjects.js';
import { getErrorMessage } from '../api/client.js';

export function useSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    subjectsApi
      .listSubjects()
      .then((list) => {
        if (ignore) return;
        setSubjects(list);
        setStatus('ready');
      })
      .catch((err) => {
        if (ignore) return;
        setError(getErrorMessage(err));
        setStatus('error');
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const retry = useCallback(() => {
    setStatus('loading');
    setReloadKey((key) => key + 1);
  }, []);

  // These throw on failure, so the form that called them can show the error message.
  const add = useCallback(async (name) => setSubjects(await subjectsApi.addSubject(name)), []);
  const rename = useCallback(async (id, name) => setSubjects(await subjectsApi.renameSubject(id, name)), []);
  const remove = useCallback(async (id) => setSubjects(await subjectsApi.deleteSubject(id)), []);

  return { subjects, status, error, retry, add, rename, remove };
}

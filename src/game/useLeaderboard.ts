```ts
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { GlobalRecord, ResultType, ScoreSubmission } from './types';

const LEADERBOARD_LIMIT = 100;

interface UseLeaderboardReturn {
  records: GlobalRecord[];
  loading: boolean;
  error: string | null;
  submission: ScoreSubmission;
  submitScore: (
    companyName: string,
    points: number,
    daysSurvived: number,
    resultType: ResultType,
    onSaved?: () => void,
    onError?: (msg: string) => void,
  ) => Promise<void>;
  refresh: () => void;
}

async function fetchTopRecords(): Promise<GlobalRecord[]> {
  const { data, error } = await supabase
    .from('global_records')
    .select('id, company_name, points, days, result_type, created_at, updated_at')
    .order('points', { ascending: false })
    .order('days', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(LEADERBOARD_LIMIT);

  if (error) throw error;
  return (data ?? []) as GlobalRecord[];
}

export function useLeaderboard(): UseLeaderboardReturn {
  const [records, setRecords] = useState<GlobalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<ScoreSubmission>({
    status: 'idle',
    globalPosition: null,
    totalRecords: null,
    errorMessage: null,
  });

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);

    void fetchTopRecords()
      .then((data) => setRecords(data))
      .catch((err) => {
        console.error('Error cargando ranking:', err);
        const message = err instanceof Error ? err.message : String(err);
        setError('No se pudo cargar la clasificación: ' + message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submitScore = useCallback(
    async (
      companyName: string,
      points: number,
      daysSurvived: number,
      resultType: ResultType,
      onSaved?: () => void,
      onError?: (msg: string) => void,
    ) => {
      setSubmission({
        status: 'saving',
        globalPosition: null,
        totalRecords: null,
        errorMessage: null,
      });

      const { data: result, error: upsertError } = await supabase.rpc(
        'upsert_global_record',
        {
          p_company_name: companyName.trim(),
          p_points: Math.round(points),
          p_days: Math.max(1, Math.min(10, Math.round(daysSurvived))),
          p_result_type: resultType,
        },
      );

      console.log('Resultado RPC:', result);
      console.error('Error RPC:', upsertError);

      const recordId = result?.id as string | undefined;
      const rank = Number(result?.rank);
      const total = Number(result?.total);

      if (
        upsertError ||
        !recordId ||
        !Number.isFinite(rank) ||
        !Number.isFinite(total)
      ) {
        const message =
          upsertError?.message ||
          upsertError?.details ||
          upsertError?.hint ||
          'Supabase no devolvió un resultado válido al guardar la puntuación.';

        setSubmission({
          status: 'error',
          globalPosition: null,
          totalRecords: null,
          errorMessage: message,
        });

        onError?.(message);
        return;
      }

      try {
        const freshRecords = await fetchTopRecords();
        setRecords(freshRecords);
      } catch (err) {
        console.error('La puntuación se guardó, pero falló la carga del ranking:', err);
      }

      setSubmission({
        status: 'saved',
        globalPosition: rank,
        totalRecords: total,
        errorMessage: null,
      });

      onSaved?.();
    },
    [],
  );

  return {
    records,
    loading,
    error,
    submission,
    submitScore,
    refresh,
  };
}
```

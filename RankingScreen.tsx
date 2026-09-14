import { Home, Trophy, Loader2, RefreshCw, Medal } from 'lucide-react';
import type { GlobalRecord } from '@/game/types';

interface RankingScreenProps {
  records: GlobalRecord[];
  loading: boolean;
  error: string | null;
  onHome: () => void;
  onRetry: () => void;
}

const resultBadge: Record<string, { label: string; color: string }> = {
  victory: { label: 'TOP', color: 'text-amber-400 bg-amber-950/40 border-amber-800' },
  competitive: { label: 'ALTA', color: 'text-sky-400 bg-sky-950/40 border-sky-800' },
  stable: { label: 'SÓLIDA', color: 'text-neutral-400 bg-neutral-800/40 border-neutral-700' },
  crisis: { label: 'CRISIS', color: 'text-red-400 bg-red-950/40 border-red-900' },
};

const medalColors = ['text-amber-400', 'text-neutral-300', 'text-orange-400'];

export function RankingScreen({ records, loading, error, onHome, onRetry }: RankingScreenProps) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black tracking-wider text-neutral-400 border border-neutral-700 rounded-full px-2.5 py-1 flex items-center gap-1.5">
          <Trophy className="w-3 h-3" />
          CLASIFICACIÓN GLOBAL
        </span>
        <span className="text-[9px] font-black tracking-wider text-neutral-400 border border-neutral-700 rounded-full px-2.5 py-1">
          {records.length} RÉCORDS
        </span>
      </div>

      <h2 className="text-2xl font-black">Mejores empresas</h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 text-neutral-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <div className="text-xs tracking-wider">CARGANDO CLASIFICACIÓN...</div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="text-red-400 text-sm text-center">NO SE PUDO CARGAR LA CLASIFICACIÓN</div>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-200 border border-neutral-700 rounded-lg px-4 py-2.5 hover:bg-neutral-800 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            REINTENTAR
          </button>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center text-neutral-600 py-6 text-sm">
          Todavía no hay partidas guardadas. ¡Sé el primero!
        </div>
      ) : (
        <div className="overflow-x-auto border border-neutral-800 rounded-xl">
          <table className="w-full border-collapse text-xs min-w-[340px]">
            <thead>
              <tr>
                <th className="text-left text-neutral-500 text-[9px] tracking-wider font-bold px-3 py-2.5 border-b border-neutral-800 w-12">
                  #
                </th>
                <th className="text-left text-neutral-500 text-[9px] tracking-wider font-bold px-3 py-2.5 border-b border-neutral-800">
                  EMPRESA
                </th>
                <th className="text-right text-neutral-500 text-[9px] tracking-wider font-bold px-3 py-2.5 border-b border-neutral-800">
                  PUNTOS
                </th>
                <th className="text-center text-neutral-500 text-[9px] tracking-wider font-bold px-3 py-2.5 border-b border-neutral-800 w-14">
                  DÍAS
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => {
                const badge = resultBadge[r.result_type] ?? resultBadge.stable;
                const isTop3 = i < 3;
                return (
                  <tr
                    key={r.id}
                    className="border-b border-neutral-850 last:border-0 hover:bg-neutral-800/30 transition-colors"
                  >
                    <td className="px-3 py-2.5">
                      {isTop3 ? (
                        <Medal className={`w-4 h-4 ${medalColors[i]}`} />
                      ) : (
                        <span className="font-bold text-neutral-500">{i + 1}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-bold">{r.company_name}</div>
                      <span
                        className={`inline-block text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded border mt-0.5 ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold">
                      {r.points.toLocaleString('es-MX')}
                    </td>
                    <td className="px-3 py-2.5 text-center text-neutral-400">{r.days}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={onHome}
        className="w-full bg-neutral-900 text-white font-bold rounded-xl py-3 border border-neutral-800 hover:bg-neutral-800 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
      >
        <Home className="w-4 h-4" />
        Inicio
      </button>
    </div>
  );
}

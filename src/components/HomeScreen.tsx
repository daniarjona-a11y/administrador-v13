import { Building2, Rocket, BookOpen, Trophy, Users } from 'lucide-react';
import type { GlobalRecord } from '@/game/types';
import { SELECT_TOP, TOTAL_PLAYERS } from '@/game/data';

interface HomeScreenProps {
  companyName: string;
  setCompanyName: (v: string) => void;
  onStart: () => void;
  onShowRules: () => void;
  onShowRanking: () => void;
  topRecords: GlobalRecord[];
}

export function HomeScreen({
  companyName,
  setCompanyName,
  onStart,
  onShowRules,
  onShowRanking,
  topRecords,
}: HomeScreenProps) {
  return (
    <div className="space-y-3">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 sm:p-10 min-h-[calc(100vh-140px)] flex flex-col justify-center text-center">
        {/* Skyline decoration */}
        <div
          className="absolute inset-x-0 bottom-0 h-48 opacity-30 pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(90deg, #151515 0 55px, #080808 55px 72px, #121212 72px 110px, #070707 110px 125px)',
            clipPath:
              'polygon(0 100%,0 56%,7% 56%,7% 34%,14% 34%,14% 61%,21% 61%,21% 23%,29% 23%,29% 48%,37% 48%,37% 12%,45% 12%,45% 55%,54% 55%,54% 30%,62% 30%,62% 8%,70% 8%,70% 49%,79% 49%,79% 19%,87% 19%,87% 55%,94% 55%,94% 28%,100% 28%,100% 100%)',
          }}
        />
        <div className="relative z-10 max-w-lg mx-auto w-full">
          <div className="text-[9px] tracking-[4px] text-neutral-600 font-black uppercase">
            Simulador de Administración
          </div>
          <div className="flex justify-center my-4">
            <div className="w-20 h-20 rounded-2xl bg-neutral-800/60 border border-neutral-700 flex items-center justify-center">
              <Building2 className="w-10 h-10 text-neutral-300" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-[0.95] tracking-tight">
            EL RETO
            <br />
            EMPRESARIAL
          </h1>
          <p className="text-neutral-500 mt-3 text-sm sm:text-base leading-relaxed">
            Construye una empresa en 10 días. Cada decisión cambia tu futuro.
          </p>
          <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 border border-neutral-700 rounded-full text-[9px] font-black tracking-wider text-neutral-400">
            <Users className="w-3 h-3" />
            {TOTAL_PLAYERS} JUGADORES · SOLO PASAN {SELECT_TOP}
          </div>

          <div className="max-w-sm mx-auto mt-6 space-y-2.5">
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              maxLength={28}
              placeholder="Nombre de tu empresa"
              autoComplete="off"
              className="w-full bg-neutral-950 border border-neutral-700 text-white rounded-xl px-4 py-3.5 text-base outline-none focus:border-neutral-500 transition-colors" inputMode="text" enterKeyHint="done"
            />
            <button
              onClick={onStart}
              className="w-full bg-neutral-100 text-neutral-950 font-black rounded-xl py-3.5 hover:bg-white transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              COMENZAR
            </button>
            <button
              onClick={onShowRules}
              className="w-full bg-neutral-900 text-white font-bold rounded-xl py-3 border border-neutral-800 hover:bg-neutral-800 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Cómo se juega
            </button>
            <button
              onClick={onShowRanking}
              className="w-full bg-neutral-900 text-white font-bold rounded-xl py-3 border border-neutral-800 hover:bg-neutral-800 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Clasificación
            </button>
          </div>
        </div>
      </div>

      {/* Top scores */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-neutral-400" />
            Mejores puntuaciones
          </h3>
          <span className="text-[9px] font-black tracking-wider text-neutral-500 border border-neutral-700 rounded-full px-2.5 py-1">
            GLOBAL
          </span>
        </div>
        <div className="space-y-1 max-h-48 overflow-auto">
          {topRecords.length > 0 ? (
            topRecords.map((r, i) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500 font-bold text-sm w-6">#{i + 1}</span>
                  <span className="font-bold text-sm">{r.company_name}</span>
                </div>
                <span className="font-bold text-sm text-neutral-300">
                  {r.points.toLocaleString('es-MX')}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-neutral-600 py-4 text-sm">
              Aún no hay puntuaciones. ¡Sé el primero!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

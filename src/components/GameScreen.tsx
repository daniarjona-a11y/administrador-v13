import { AlertTriangle, Users, TrendingDown } from 'lucide-react';
import type { GameEvent, GameState } from '@/game/types';
import { QUESTIONS_PER_DAY, RISK_LOSS_THRESHOLD, SELECT_TOP, TOTAL_DAYS, TOTAL_PLAYERS } from '@/game/data';
import { ProgressBar } from '@/components/ProgressBar';

interface GameScreenProps {
  state: GameState;
  currentEvent: GameEvent;
  onChoose: (i: number) => void;
}

function formatMoney(n: number): string {
  return '$' + Math.round(n).toLocaleString('es-MX');
}

export function GameScreen({ state, currentEvent, onChoose }: GameScreenProps) {
  const totalQuestions = TOTAL_DAYS * QUESTIONS_PER_DAY;
  const currentQuestion = (state.day - 1) * QUESTIONS_PER_DAY + state.questionInDay;
  const remainingPlayers = Math.max(0, TOTAL_PLAYERS - Math.round((currentQuestion / totalQuestions) * (TOTAL_PLAYERS - SELECT_TOP)));

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[9px] font-black tracking-wider text-neutral-400 border border-neutral-700 rounded-full px-2.5 py-1">
            DÍA {state.day} / {TOTAL_DAYS}
          </span>
          <span className="text-[9px] font-black tracking-wider text-neutral-400 border border-neutral-700 rounded-full px-2.5 py-1">
            PREGUNTA {state.questionInDay + 1} / {QUESTIONS_PER_DAY}
          </span>
        </div>
        <ProgressBar current={currentQuestion} total={totalQuestions} />

        {/* Minimal status: money, risk, remaining players */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-2.5">
            <div className="text-[8px] tracking-wider text-neutral-500 font-bold uppercase">Dinero</div>
            <div className="text-base font-bold mt-0.5">{formatMoney(state.money)}</div>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-2.5">
            <div className="text-[8px] tracking-wider text-neutral-500 font-bold uppercase">Riesgo</div>
            <div className={`text-base font-bold mt-0.5 ${state.risk >= RISK_LOSS_THRESHOLD - 15 ? 'text-red-400' : ''}`}>
              {Math.round(state.risk)}
              <span className="text-[9px] text-neutral-600 ml-1">/ {RISK_LOSS_THRESHOLD}</span>
            </div>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-2.5">
            <div className="text-[8px] tracking-wider text-neutral-500 font-bold uppercase">Quedan</div>
            <div className="text-base font-bold mt-0.5 flex items-center gap-1">
              <Users className="w-3 h-3 text-neutral-500" />
              {remainingPlayers}
            </div>
          </div>
        </div>

        {/* Risk warning */}
        {state.risk >= RISK_LOSS_THRESHOLD - 15 && (
          <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-red-400 font-bold">
            <AlertTriangle className="w-3 h-3" />
            Riesgo crítico: si llega a {RISK_LOSS_THRESHOLD}, quedas eliminado
          </div>
        )}
      </div>

      {/* Question */}
      <div className="rounded-2xl border-l-4 border-l-neutral-300 border border-neutral-800 bg-neutral-900/50 p-4 space-y-3 animate-[fadeIn_0.3s_ease-out]">
        <h2 className="text-xl font-black">{currentEvent.title}</h2>
        <p className="text-neutral-500 text-sm leading-relaxed">{currentEvent.text}</p>
        <div className="space-y-2 pt-1">
          {currentEvent.opts.map((opt, i) => {
            const isRisky = i === currentEvent.riskyIndex;
            return (
              <button
                key={i}
                onClick={() => onChoose(i)}
                className={`w-full text-left rounded-xl border p-3.5 transition-all active:scale-[0.99] ${
                  isRisky
                    ? 'border-neutral-700 bg-neutral-800/40 hover:bg-neutral-800/70'
                    : 'border-neutral-800 bg-neutral-850 hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <strong className="block font-black text-sm">
                      {String.fromCharCode(65 + i)} · {opt[0]}
                    </strong>
                    <span className="block text-neutral-500 text-[10px] mt-1 leading-relaxed">
                      {opt[1]}
                    </span>
                  </div>
                  {isRisky && (
                    <span className="flex items-center gap-1 text-[8px] font-black tracking-wider text-neutral-500 shrink-0">
                      <AlertTriangle className="w-3 h-3" />
                      ALTO RIESGO
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
        <h3 className="font-bold text-sm mb-2">Administración</h3>
        <div className="text-xs text-neutral-400 border-l-2 border-neutral-600 pl-3 leading-relaxed">
          {currentEvent.topic}
        </div>
      </div>

      {/* Log */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
        <h3 className="font-bold text-sm mb-2">Historial</h3>
        <div className="max-h-56 overflow-auto space-y-0">
          {state.log.length > 0 ? (
            state.log
              .slice()
              .reverse()
              .map((entry, i) => (
                <div key={i} className="text-xs text-neutral-500 py-2 border-b border-neutral-800 last:border-0">
                  {entry}
                </div>
              ))
          ) : (
            <div className="text-xs text-neutral-600 text-center py-3">Tu partida comienza aquí.</div>
          )}
        </div>
      </div>
    </div>
  );
}

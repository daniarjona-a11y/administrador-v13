import { Trophy, TrendingUp, Building2, AlertTriangle, Award, Loader2, RefreshCw } from 'lucide-react';
import type { GameState, ScoreSubmission } from '@/game/types';
import { SELECT_TOP, TOTAL_PLAYERS } from '@/game/data';

interface ResultScreenProps {
  state: GameState;
  submission: ScoreSubmission;
  onShowRanking: () => void;
  onNewGame: () => void;
  onHome: () => void;
  onRetrySave: () => void;
}

export function ResultScreen({
  state,
  submission,
  onShowRanking,
  onNewGame,
  onHome,
  onRetrySave,
}: ResultScreenProps) {
  const lost = state.lost;

  const config = lost
    ? {
        icon: AlertTriangle,
        tag: 'ELIMINADO',
        title: 'Quedaste fuera',
        text: `No lograste sobrevivir los 10 días. De ${TOTAL_PLAYERS} jugadores, solo los mejores ${SELECT_TOP} pasan. Tus decisiones acumularon demasiada presión y la empresa cayó.`,
      }
    : state.finalScore >= 9500
      ? {
          icon: Trophy,
          tag: 'TOP 5 · APROBADO',
          title: 'Empresa extraordinaria',
          text: `Sobreviviste los 10 días y quedaste entre los mejores ${SELECT_TOP} de ${TOTAL_PLAYERS}. Encontraste una combinación poco común de crecimiento, dinero y control.`,
        }
      : state.finalScore >= 8500
        ? {
            icon: TrendingUp,
            tag: 'EMPRESA COMPETITIVA',
            title: 'Gran gestión',
            text: `Lograste sobrevivir los 10 días con una empresa fuerte. Te acercaste a la zona de los mejores ${SELECT_TOP}.`,
          }
        : {
            icon: Building2,
            tag: 'EMPRESA SÓLIDA',
            title: 'Empresa estable',
            text: 'Tu empresa llegó al final con una base funcional. Aún hay espacio para mejorar la estrategia y subir posiciones.',
          };

  const Icon = config.icon;
  const days = state.lost ? state.day : 10;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 sm:p-10 min-h-[calc(100vh-140px)] flex flex-col justify-center text-center">
      <div className="relative z-10 max-w-md mx-auto w-full space-y-4">
        <div className="flex justify-center">
          <div
            className={`w-20 h-20 rounded-2xl border flex items-center justify-center ${
              lost
                ? 'bg-red-950/30 border-red-900'
                : state.finalScore >= 9500
                  ? 'bg-amber-950/30 border-amber-800'
                  : 'bg-neutral-800/60 border-neutral-700'
            }`}
          >
            <Icon
              className={`w-10 h-10 ${
                lost
                  ? 'text-red-400'
                  : state.finalScore >= 9500
                    ? 'text-amber-400'
                    : 'text-neutral-300'
              }`}
              strokeWidth={1.5}
            />
          </div>
        </div>

        <div className="text-[9px] font-black tracking-wider text-neutral-500 border border-neutral-700 rounded-full px-3 py-1.5 inline-block">
          {config.tag}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black">{config.title}</h2>
        <p className="text-neutral-500 text-sm leading-relaxed">{config.text}</p>

        {/* PUNTUACIÓN FINAL */}
        <div className="py-3 border-y border-neutral-800">
          <div className="text-[9px] font-black tracking-[3px] text-neutral-600 mb-1">
            PUNTUACIÓN FINAL
          </div>
          <div className="text-4xl sm:text-5xl font-black tracking-tight">
            {state.finalScore.toLocaleString('es-MX')}
          </div>
          <div className="text-neutral-500 text-sm mt-1">puntos</div>
        </div>

        {/* TU POSICIÓN GLOBAL */}
        <div className="py-2">
          {submission.status === 'saving' && (
            <div className="flex items-center justify-center gap-2 text-neutral-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando en el ranking global...
            </div>
          )}
          {submission.status === 'saved' && submission.globalPosition !== null && (
            <div className="space-y-1">
              <div className="text-[9px] font-black tracking-[3px] text-neutral-600">
                TU POSICIÓN GLOBAL
              </div>
              <div className="flex items-center justify-center gap-2 text-neutral-200 text-lg font-black">
                <Award className="w-5 h-5 text-amber-400" />
                #{submission.globalPosition}
              </div>
              <div className="text-neutral-500 text-xs">
                de {submission.totalRecords} empresas
              </div>
            </div>
          )}
          {submission.status === 'saved' && submission.globalPosition === null && (
            <div className="text-neutral-500 text-xs">
              Puntuación guardada, pero no se pudo determinar tu posición.
            </div>
          )}
          {submission.status === 'error' && (
            <div className="space-y-2">
              <div className="text-neutral-500 text-xs leading-relaxed">
                {submission.errorMessage}
              </div>
              <button
                onClick={onRetrySave}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-300 border border-neutral-700 rounded-lg px-3 py-2 hover:bg-neutral-800 transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                Reintentar
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={onShowRanking}
            className="w-full bg-neutral-100 text-neutral-950 font-black rounded-xl py-3.5 hover:bg-white transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            VER CLASIFICACIÓN
          </button>
          <button
            onClick={onNewGame}
            className="w-full bg-neutral-900 text-white font-bold rounded-xl py-3 border border-neutral-800 hover:bg-neutral-800 transition-all active:scale-[0.99]"
          >
            NUEVA PARTIDA
          </button>
          <button
            onClick={onHome}
            className="w-full bg-neutral-900 text-white font-bold rounded-xl py-3 border border-neutral-800 hover:bg-neutral-800 transition-all active:scale-[0.99]"
          >
            Inicio
          </button>
        </div>

        <div className="text-[10px] text-neutral-600 pt-2">
          {state.name} · {days} días
        </div>
      </div>
    </div>
  );
}

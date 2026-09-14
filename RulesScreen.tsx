import { Rocket, Home } from 'lucide-react';
import { SELECT_TOP, TOTAL_DAYS, TOTAL_PLAYERS } from '@/game/data';

interface RulesScreenProps {
  onStart: () => void;
  onHome: () => void;
}

export function RulesScreen({ onStart, onHome }: RulesScreenProps) {
  const rules = [
    [`Comienzas como uno de ${TOTAL_PLAYERS} jugadores. Solo los mejores ${SELECT_TOP} sobreviven.`, '1'],
    [`Juegas durante ${TOTAL_DAYS} días, 3 decisiones por día.`, '2'],
    ['Cada decisión tiene 3 opciones. Una de ellas es de alto riesgo.', '3'],
    ['El riesgo te hace perder: si llega a 75, quedas eliminado.', '4'],
    ['También pierdes si te quedas sin dinero, liquidez o reputación.', '5'],
    ['Cada partida mezcla las preguntas en un orden diferente.', '6'],
    ['Las decisiones arriesgadas pueden dar grandes ventajas, pero también caídas enormes.', '7'],
  ];

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-4">
      <div className="text-[9px] font-black tracking-wider text-neutral-500 border border-neutral-700 rounded-full px-2.5 py-1 inline-block">
        MANUAL
      </div>
      <h2 className="text-2xl font-black">Cómo jugar</h2>
      <div className="space-y-2.5">
        {rules.map(([text, num]) => (
          <p key={num} className="text-neutral-400 leading-relaxed text-sm">
            <span className="font-black text-neutral-200">{num}.</span> {text}
          </p>
        ))}
      </div>
      <div className="space-y-2.5 pt-2">
        <button
          onClick={onStart}
          className="w-full bg-neutral-100 text-neutral-950 font-black rounded-xl py-3.5 hover:bg-white transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <Rocket className="w-4 h-4" />
          EMPEZAR
        </button>
        <button
          onClick={onHome}
          className="w-full bg-neutral-900 text-white font-bold rounded-xl py-3 border border-neutral-800 hover:bg-neutral-800 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          Inicio
        </button>
      </div>
    </div>
  );
}

import { useCallback, useMemo, useState } from 'react';
import { events, QUESTIONS_PER_DAY, RISK_LOSS_THRESHOLD, STARTING_MONEY, TOTAL_DAYS } from './data';
import type { GameEvent, GameState, ResultType } from './types';

function createInitialState(name: string): GameState {
  return {
    day: 1,
    name,
    money: STARTING_MONEY,
    growth: 0,
    prod: 50,
    rep: 50,
    liq: 60,
    risk: 10,
    sat: 55,
    trust: 50,
    points: 0,
    questionInDay: 0,
    log: [],
    lost: false,
    finalScore: 0,
    resultType: 'stable',
  };
}

function checkLoss(s: GameState): boolean {
  return (
    s.money <= 0 ||
    s.liq <= 0 ||
    s.risk >= RISK_LOSS_THRESHOLD ||
    (s.sat <= 10 && s.trust <= 15) ||
    s.rep <= 0
  );
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

function computeScore(s: GameState, lost: boolean): { score: number; type: ResultType } {
  if (lost) {
    const score = Math.max(0, Math.round(800 + s.points + s.money / 10));
    return { score, type: 'crisis' as ResultType };
  }

  let score =
    5000 +
    s.points +
    s.money / 5 +
    s.growth * 20 +
    s.prod * 12 +
    s.rep * 10 +
    s.liq * 8 +
    s.sat * 5 +
    s.trust * 4 -
    s.risk * 10;

  if (s.money > 10000) score += 500;
  if (s.risk < 30 && s.growth > 30) score += 450;
  if (s.rep > 70 && s.prod > 75) score += 400;

  score = Math.max(0, Math.round(score));

  let type: ResultType = 'stable';
  if (score >= 9500) type = 'victory';
  else if (score >= 8500) type = 'competitive';

  return { score, type };
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface UseGameReturn {
  state: GameState;
  currentEvent: GameEvent;
  eventQueue: GameEvent[];
  start: (name: string) => void;
  choose: (i: number) => void;
  reset: (name?: string) => void;
}

export function useGame(): UseGameReturn {
  const [state, setState] = useState<GameState>(() => createInitialState(''));
  const [eventQueue, setEventQueue] = useState<GameEvent[]>([]);

  const start = useCallback((name: string) => {
    const shuffled = shuffle(events);
    setState(createInitialState(name || 'Empresa sin nombre'));
    setEventQueue(shuffled);
  }, []);

  const choose = useCallback((i: number) => {
    setState((prev) => {
      if (prev.lost || prev.finalScore > 0) return prev;

      const eventIndex = (prev.day - 1) * QUESTIONS_PER_DAY + prev.questionInDay;
      const event = eventQueue[eventIndex];
      if (!event) return prev;

      const ef = event.effects[i];
      const next: GameState = {
        ...prev,
        money: prev.money + ef[0],
        growth: prev.growth + ef[1],
        prod: prev.prod + ef[2],
        rep: prev.rep + ef[3],
        liq: prev.liq + ef[4],
        risk: prev.risk + ef[5],
        sat: prev.sat + Math.round((ef[2] + ef[3]) / 2),
        trust: prev.trust + Math.round(ef[3] / 2),
        points:
          prev.points +
          Math.max(0, ef[0] / 5) +
          ef[1] * 10 +
          ef[2] * 4 +
          ef[3] * 3 +
          ef[4] * 2 -
          ef[5] * 2,
        log: [
          ...prev.log,
          `Día ${prev.day} · P${prev.questionInDay + 1}: ${event.title} → ${String.fromCharCode(65 + i)}`,
        ],
      };

      const newQuestionInDay = prev.questionInDay + 1;

      if (checkLoss(next)) {
        const { score, type } = computeScore(next, true);
        return { ...next, lost: true, finalScore: score, resultType: type, questionInDay: newQuestionInDay };
      }

      if (newQuestionInDay >= QUESTIONS_PER_DAY) {
        // End of day — apply daily income/maintenance
        const after: GameState = {
          ...next,
          questionInDay: 0,
          money: Math.round(
            next.money + 120 + next.growth * 4 + next.prod * 2 - Math.max(0, next.risk - 50) * 5,
          ),
          liq: clamp(next.liq + 1 - Math.max(0, next.risk - 60) * 0.4),
          rep: clamp(next.rep + (next.sat < 30 ? -3 : 1)),
          prod: clamp(next.prod + (next.sat < 30 ? -3 : 1)),
          risk: clamp(next.risk),
        };

        if (checkLoss(after)) {
          const { score, type } = computeScore(after, true);
          return { ...after, lost: true, finalScore: score, resultType: type };
        }

        if (after.day >= TOTAL_DAYS) {
          const { score, type } = computeScore(after, false);
          return { ...after, finalScore: score, resultType: type };
        }

        return { ...after, day: after.day + 1 };
      }

      return { ...next, questionInDay: newQuestionInDay };
    });
  }, [eventQueue]);

  const reset = useCallback((name?: string) => {
    const shuffled = shuffle(events);
    setState(createInitialState(name ?? ''));
    setEventQueue(shuffled);
  }, []);

  const eventIndex = (state.day - 1) * QUESTIONS_PER_DAY + state.questionInDay;
  const currentEvent = useMemo(() => eventQueue[eventIndex] ?? events[0], [eventQueue, eventIndex]);

  return {
    state,
    currentEvent,
    eventQueue,
    start,
    choose,
    reset,
  };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { Building2 } from 'lucide-react';
import type { Screen } from '@/game/types';
import { useGame } from '@/game/useGame';
import { useLeaderboard } from '@/game/useLeaderboard';
import { HomeScreen } from '@/components/HomeScreen';
import { RulesScreen } from '@/components/RulesScreen';
import { GameScreen } from '@/components/GameScreen';
import { ResultScreen } from '@/components/ResultScreen';
import { RankingScreen } from '@/components/RankingScreen';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [companyName, setCompanyName] = useState('');
  const scoreSavedRef = useRef(false);
  const scoreSubmittingRef = useRef(false);

  const game = useGame();
  const leaderboard = useLeaderboard();

  const show = useCallback((s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const startGame = useCallback(() => {
    game.start(companyName);
    scoreSavedRef.current = false;
    scoreSubmittingRef.current = false;
    show('game');
  }, [companyName, game, show]);

  const newGame = useCallback(() => {
    game.reset(companyName);
    scoreSavedRef.current = false;
    scoreSubmittingRef.current = false;
    show('game');
  }, [companyName, game, show]);

  const submitCurrentScore = useCallback(() => {
    if (game.state.finalScore <= 0 || scoreSavedRef.current || scoreSubmittingRef.current) return;
    scoreSubmittingRef.current = true;
    const days = game.state.lost ? game.state.day : 10;
    leaderboard.submitScore(
      game.state.name,
      game.state.finalScore,
      days,
      game.state.resultType,
      () => {
        scoreSavedRef.current = true;
        scoreSubmittingRef.current = false;
      },
      () => {
        scoreSavedRef.current = false;
        scoreSubmittingRef.current = false;
      },
    );
  }, [game.state, leaderboard]);

  // Watch for game over — submit score to global leaderboard once
  useEffect(() => {
    if (game.state.finalScore > 0 && !scoreSavedRef.current) {
      submitCurrentScore();
    }
    if (game.state.finalScore > 0 && screen === 'game') {
      show('result');
    }
  }, [game.state.finalScore, screen, submitCurrentScore, show]);

  return (
    <div className="min-h-screen bg-black text-neutral-100">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 bg-black/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center gap-2.5">
          <Building2 className="w-5 h-5 text-neutral-300" strokeWidth={2} />
          <div>
            <div className="text-lg font-black tracking-wide leading-none">ADMINISTRADOR</div>
            <div className="text-[8px] tracking-[3px] text-neutral-600 font-bold mt-0.5">
              EL RETO EMPRESARIAL · V13
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-3.5 pb-10">
        {screen === 'home' && (
          <HomeScreen
            companyName={companyName}
            setCompanyName={setCompanyName}
            onStart={startGame}
            onShowRules={() => show('rules')}
            onShowRanking={() => show('ranking')}
            topRecords={leaderboard.records.slice(0, 5)}
          />
        )}

        {screen === 'rules' && (
          <RulesScreen
            onStart={startGame}
            onHome={() => show('home')}
          />
        )}

        {screen === 'game' && (
          <GameScreen
            state={game.state}
            currentEvent={game.currentEvent}
            onChoose={game.choose}
          />
        )}

        {screen === 'result' && (
          <ResultScreen
            state={game.state}
            submission={leaderboard.submission}
            onShowRanking={() => show('ranking')}
            onNewGame={newGame}
            onHome={() => show('home')}
            onRetrySave={submitCurrentScore}
          />
        )}

        {screen === 'ranking' && (
          <RankingScreen
            records={leaderboard.records}
            loading={leaderboard.loading}
            error={leaderboard.error}
            onHome={() => show('home')}
            onRetry={leaderboard.refresh}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-neutral-600 text-[9px] py-4">
        ADMINISTRADOR · El Reto Empresarial V13
      </footer>
    </div>
  );
}

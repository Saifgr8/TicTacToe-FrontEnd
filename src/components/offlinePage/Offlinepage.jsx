import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Flag, Sparkles } from "lucide-react";
import Dice from "../Ui/Dice";
import MatchRules from "../Ui/MatchRules";
import MatchMoves from "../Ui/MatchMoves";
import Footer from "../Ui/Footer";

const offlineMatchRules = [0, 2, 3, 6, 7, 9];

const Offlinepage = () => {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [player1Symbol, setPlayer1Symbol] = useState("");
  const [player2Symbol, setPlayer2Symbol] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [player1Color, setPlayer1Color] = useState("");
  const [player2Color, setPlayer2Color] = useState("");
  const [rulesRead, setRulesRead] = useState(false);
  const [movesRead, setMovesRead] = useState(false);
  const matchSetupRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentPlayer) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    matchSetupRef.current?.scrollIntoView({
      behavior: reducedMotion ? "instant" : "smooth",
      block: "start",
    });
  }, [currentPlayer]);

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col bg-[#f8f8fc] text-slate-900 dark:bg-slate-950 dark:text-white">
      <main className="relative flex-1 overflow-hidden bg-[length:80px_80px] bg-[linear-gradient(to_right,rgba(99,102,241,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.07)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]">
        <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-900/30" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-32 h-80 w-80 rounded-full bg-rose-100/70 blur-3xl dark:bg-fuchsia-900/20" />
        <div className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
          <Dice
            player1={player1}
            setPlayer1={setPlayer1}
            player2={player2}
            setPlayer2={setPlayer2}
            setPlayer1Symbol={setPlayer1Symbol}
            setPlayer2Symbol={setPlayer2Symbol}
            currentPlayer={currentPlayer}
            setCurrentPlayer={setCurrentPlayer}
            player1Color={player1Color}
            player2Color={player2Color}
            setPlayer1Color={setPlayer1Color}
            setPlayer2Color={setPlayer2Color}
          />

          {currentPlayer && (
            <section ref={matchSetupRef} id="match-setup" className="mt-16 scroll-mt-6 border-t border-slate-200 pt-12 dark:border-slate-800" aria-labelledby="match-setup-title">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400"><Sparkles aria-hidden="true" className="h-4 w-4" /> Almost ready</p>
              <h2 id="match-setup-title" className="mt-2 text-3xl font-bold tracking-tight">Your match setup</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-400">Meet the players, then review the rules before the match.</p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  { name: player1, symbol: player1Symbol, color: player1Color },
                  { name: player2, symbol: player2Symbol, color: player2Color },
                ].map((player, index) => (
                  <div key={index} className={`${player.color || "bg-slate-700"} flex items-center justify-between gap-4 rounded-2xl p-5 text-white shadow-sm`}>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-white">Player {index + 1}</p>
                      <p className="mt-2 break-words text-xl font-bold">{player.name}</p>
                    </div>
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-black/20 text-3xl font-black">{player.symbol || "—"}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200"><Flag aria-hidden="true" className="h-4 w-4 shrink-0" /><strong>{currentPlayer}</strong> starts first.</p>

              <div className="mt-10">
                <h3 className="text-xl font-bold">Get to know the game</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Read both guides and select Done, or skip each guide to unlock the match.</p>
                <div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-400">Match rules {rulesRead && "✓"}</p>
                    <MatchRules valid={offlineMatchRules} timeoutForfeit setRulesRead={setRulesRead} allowSkip />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-400">Special moves {movesRead && "✓"}</p>
                    <MatchMoves setMovesRead={setMovesRead} allowSkip />
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={!movesRead || !rulesRead}
                onClick={() => navigate("/offlineGamePage")}
                className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
              >
                {!rulesRead || !movesRead ? "Complete both guides to continue" : "Begin match"} <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Offlinepage;

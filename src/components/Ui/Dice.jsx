import { useEffect, useRef, useState } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Dices, Sparkles, Trophy, Users, X } from "lucide-react";
import ColorPicker from "./ColorPicker";

const Dice = ({
  player1,
  setPlayer1,
  player2,
  setPlayer2,
  setPlayer1Symbol,
  setPlayer2Symbol,
  currentPlayer,
  setCurrentPlayer,
  player1Color,
  player2Color,
  setPlayer1Color,
  setPlayer2Color,
}) => {
  const [rolling, setRolling] = useState(false);
  const [roll, setRoll] = useState(null);
  const [winner, setWinner] = useState(null);
  const [open, setOpen] = useState(true);
  const [nameReady, setNameReady] = useState(false);
  const [symbolModal, setSymbolModal] = useState(false);
  const timers = useRef([]);
  const reduceMotion = useReducedMotion();
  const mode = localStorage.getItem("mode");
  const username = localStorage.getItem("username");

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const rollDice = () => {
    if (rolling || winner) return;
    setRolling(true);
    const randomValue = Math.floor(Math.random() * 6) + 1;
    timers.current.push(setTimeout(() => {
      setRolling(false);
      setRoll(randomValue);
      setWinner(randomValue <= 3 ? player2 : player1);
      timers.current.push(setTimeout(() => setSymbolModal(true), 1500));
    }, 1500));
  };

  const handleSymbolChoice = (symbol) => {
    const otherSymbol = symbol === "X" ? "O" : "X";
    const p1Symbol = winner === player1 ? symbol : otherSymbol;
    const p2Symbol = winner === player1 ? otherSymbol : symbol;

    setPlayer1Symbol(p1Symbol);
    setPlayer2Symbol(p2Symbol);
    setCurrentPlayer(winner);
    localStorage.setItem("player1Symbol", p1Symbol);
    localStorage.setItem("player2Symbol", p2Symbol);
    localStorage.setItem("currentPlayer", winner);
    setSymbolModal(false);
  };

  useEffect(() => {
    if (symbolModal && winner === "tictacbot") {
      const timer = setTimeout(() => {
        const botChoice = Math.random() > 0.5 ? "X" : "O";
        const player1Choice = botChoice === "X" ? "O" : "X";
        setPlayer2Symbol(botChoice);
        setPlayer1Symbol(player1Choice);
        setCurrentPlayer(player2);
        localStorage.setItem("currentPlayer", player2);
        localStorage.setItem("player1Symbol", player1Choice);
        localStorage.setItem("player2Symbol", botChoice);
        setSymbolModal(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [symbolModal, winner, player2, setCurrentPlayer, setPlayer1Symbol, setPlayer2Symbol]);

  const inputStyle = "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-70 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-indigo-900";

  return (
    <>
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-indigo-700 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300">
            <Dices aria-hidden="true" className="h-4 w-4" /> Match setup
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            Let the dice <span className="text-indigo-600 dark:text-indigo-400">decide.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300">
            One roll decides who chooses a symbol and makes the first move.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Roll 1–3</p>
              <p className="mt-2 font-semibold">{player2 || "Player 2"} goes first</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Roll 4–6</p>
              <p className="mt-2 font-semibold">{player1 || "Player 1"} goes first</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-[0_24px_70px_-35px_rgba(67,56,202,0.4)] dark:border-slate-700 dark:bg-slate-900 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Your roll</p>
          <div className="my-8 flex justify-center">
            <Motion.div
              animate={rolling && !reduceMotion ? { rotate: [0, -12, 12, -8, 0], scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="flex h-32 w-32 items-center justify-center rounded-[2rem] bg-gradient-to-br from-indigo-500 to-indigo-700 text-6xl font-black text-white shadow-xl shadow-indigo-500/30"
            >
              {roll ?? <Dices aria-hidden="true" className="h-16 w-16" />}
            </Motion.div>
          </div>
          <div role="status" aria-live="polite" className="min-h-16">
            {winner ? (
              <>
                <p className="text-xl font-bold">{roll <= 3 ? "You lost the roll" : "You won the roll"}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{winner} chooses a symbol and starts.</p>
              </>
            ) : (
              <>
                <p className="text-xl font-bold">{rolling ? "Rolling..." : "Ready to roll?"}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A number from 1 to 6 will decide.</p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={rollDice}
            disabled={open || rolling || Boolean(winner)}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
          >
            {rolling ? "Rolling..." : winner ? "Roll complete" : "Roll dice"} <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
          {currentPlayer && (
            <a href="#match-setup" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-indigo-300">
              Continue to match setup <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="setup-title" className="my-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <span className="inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"><Users aria-hidden="true" className="h-5 w-5" /></span>
              <Link
                to="/"
                aria-label="Close match setup and return home"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </Link>
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Step {nameReady ? "2" : "1"} of 2</p>
            <h2 id="setup-title" className="mt-1 text-2xl font-bold">{nameReady ? "Choose your colors" : "Meet the players"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {nameReady ? "Each player picks and confirms a color." : "Set up your opponents before rolling the dice."}
            </p>

            {!nameReady ? (
              <div className="mt-6 space-y-4">
                <label className="block text-sm font-semibold">Player 1
                  <input type="text" value={username || "Player 1"} disabled className={inputStyle} />
                </label>
                <label className="block text-sm font-semibold">Player 2
                  {mode === "offlinebot" ? (
                    <input type="text" value="tictacbot" disabled className={inputStyle} />
                  ) : (
                    <input type="text" placeholder="Enter Player 2 Name" value={player2} onChange={(event) => setPlayer2(event.target.value)} className={inputStyle} />
                  )}
                </label>
                <button
                  type="button"
                  disabled={player2 === "" && mode !== "offlinebot"}
                  onClick={() => {
                    const p2 = player2 === "" ? "tictacbot" : player2;
                    setPlayer1(username);
                    setPlayer2(p2);
                    localStorage.setItem("player1", username);
                    localStorage.setItem("player2", p2);
                    setNameReady(true);
                  }}
                  className="min-h-12 w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
                >
                  Choose colors
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold">
                  {player1Color === "" || player2Color === ""
                    ? `Choosing for ${player1Color === "" ? username : player2}`
                    : "Color selection complete"}
                </p>
                <ColorPicker
                  player1Color={player1Color}
                  player2Color={player2Color}
                  setPlayer1Color={setPlayer1Color}
                  setPlayer2Color={setPlayer2Color}
                  player1={player1}
                  player2={player2}
                />
                <button
                  type="button"
                  disabled={player1Color === "" || player2Color === ""}
                  onClick={() => {
                    localStorage.setItem("player1Color", player1Color);
                    localStorage.setItem("player2Color", player2Color);
                    setOpen(false);
                  }}
 className="mt-5 min-h-12 w-full rounded-xl bg-indigo-600 px-4 py-3
    font-bold text-white transition-all duration-200
    hover:bg-indigo-700
    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
    disabled:cursor-not-allowed
    disabled:bg-slate-300 disabled:text-slate-500
    disabled:shadow-none disabled:hover:bg-slate-300
    dark:disabled:bg-slate-700 dark:disabled:text-slate-400"                >
                  Continue to dice
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {symbolModal && winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="symbol-title" className="my-auto w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white">
            <span className="mx-auto inline-flex rounded-2xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-950 dark:text-amber-400"><Trophy aria-hidden="true" className="h-6 w-6" /></span>
            <h2 id="symbol-title" className="mt-5 text-2xl font-bold">{winner} won the roll!</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {winner === "tictacbot" ? "The bot is choosing its symbol..." : "Choose the symbol you want to play."}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {["X", "O"].map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  aria-label={`Choose ${symbol}`}
                  disabled={winner === "tictacbot"}
                  onClick={() => handleSymbolChoice(symbol)}
                  className={`min-h-20 rounded-2xl text-4xl font-black transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 ${symbol === "X" ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300" : "bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300"}`}
                >
                  {symbol}
                </button>
              ))}
            </div>
            <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> The other player gets the remaining symbol.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Dice;

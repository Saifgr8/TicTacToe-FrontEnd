import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  Bot,
  ChevronDown,
  Globe2,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import Footer from "../Ui/Footer";
import MatchMoves from "../Ui/MatchMoves";
import MatchRules from "../Ui/MatchRules";
import { GenerateRandomItem } from "../auth/GenerateRandomItem";

const onlineMatchRules = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const offlineMatchRules = [0, 2, 3, 6, 7, 9];

const RuleDisclosure = ({ title, mode, children }) => {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="border-t border-slate-200 dark:border-slate-700">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${mode} ${title}`}
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-slate-700 transition hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-slate-200 dark:hover:text-indigo-300"
      >
        {title}
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div id={panelId} hidden={!open} className="pb-4">
        {open && children(() => setOpen(false))}
      </div>
    </div>
  );
};

const Homepage = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let interval;

    const updateAnimation = () => {
      clearInterval(interval);
      if (motionPreference.matches) {
        setItems([]);
        return;
      }
      interval = setInterval(() => {
        setItems((previous) => [...previous, GenerateRandomItem()]);
      }, 1500);
    };

    updateAnimation();
    motionPreference.addEventListener("change", updateAnimation);
    return () => {
      clearInterval(interval);
      motionPreference.removeEventListener("change", updateAnimation);
    };
  }, []);

  return (
    <div className="bg-[#f8f8fc] text-slate-900 dark:bg-slate-950 dark:text-white">
      <main className="relative overflow-hidden bg-[length:80px_80px] bg-[linear-gradient(to_right,rgba(99,102,241,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.07)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {items.map((item) => (
            <span
              key={item.id}
              onAnimationEnd={() => setItems((previous) => previous.filter((entry) => entry.id !== item.id))}
              className={`fade-out absolute p-2 text-6xl font-bold ${item.type === "X" ? "text-blue-500/40 dark:text-blue-400/40" : "text-red-500/40 dark:text-red-400/40"}`}
              style={{ left: `${item.X * 80}px`, top: `${item.Y * 80}px` }}
            >
              {item.type}
            </span>
          ))}
        </div>
        <section className="relative overflow-hidden px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24">
          <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-900/30" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-rose-100/80 blur-3xl dark:bg-fuchsia-900/20" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-indigo-700 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300">
                <Sparkles aria-hidden="true" className="h-4 w-4" />
                A classic, reimagined
              </span>
              <h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Tic Tac Toe,
                <br />
                <span className="text-indigo-600 dark:text-indigo-400">with a twist.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600 dark:text-slate-300">
                The game you know, with new moves to keep you guessing. Challenge a friend or take on the bot.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#play"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
                >
                  Choose how to play <ArrowDown aria-hidden="true" className="h-4 w-4" />
                </a>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Play a friend or the bot
                </span>
              </div>
            </div>

            <div aria-hidden="true" className="relative mx-auto w-full max-w-[410px]">
              <div className="absolute -left-3 top-6 h-full w-full rotate-6 rounded-[2rem] bg-indigo-200 dark:bg-indigo-900/60" />
              <div className="relative rounded-[2rem] border border-white bg-white p-5 shadow-[0_24px_70px_-20px_rgba(67,56,202,0.28)] dark:border-slate-700 dark:bg-slate-900 sm:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">The game is on</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">Make your move</p>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">X / O</span>
                </div>
                <div className="grid aspect-square grid-cols-3 gap-2 sm:gap-3">
                  {["X", "O", "", "", "X", "O", "O", "", "X"].map((symbol, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-center rounded-xl text-4xl font-black sm:text-5xl ${
                        symbol === "X"
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                          : symbol === "O"
                          ? "bg-rose-50 text-rose-400 dark:bg-rose-950/60 dark:text-rose-400"
                          : "bg-slate-50 dark:bg-slate-800"
                      }`}
                    >
                      {symbol}
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <Zap className="h-4 w-4 text-amber-500" /> More than just Xs and Os
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="play" className="relative scroll-mt-6 px-5 pb-20 sm:px-8 sm:pb-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Pick your match</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Ready to play?</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-400">Choose an opponent and make your first move.</p>
            </div>

            <div className="grid items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                    <Users aria-hidden="true" className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Play now</p>
                    <h3 className="mt-1 text-2xl font-bold">Offline match</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Play together on one device or put your strategy to the test against the bot.</p>
                  </div>
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <Link
                    onClick={() => localStorage.setItem("mode", "offline1v1")}
                    to="/offlinePage"
                    className="group flex min-h-14 items-center justify-between gap-3 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <span className="flex items-center gap-2"><Users aria-hidden="true" className="h-4 w-4" /> Play against person</span>
                    <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    onClick={() => localStorage.setItem("mode", "offlinebot")}
                    to="/offlinePage"
                    className="group flex min-h-14 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-indigo-300 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-indigo-500 dark:hover:bg-slate-700"
                  >
                    <span className="flex items-center gap-2"><Bot aria-hidden="true" className="h-4 w-4" /> Play against bot</span>
                    <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
                <p className="mb-2 mt-8 text-xs font-bold uppercase tracking-wider text-slate-400">Learn the game</p>
                <RuleDisclosure title="Match Rules" mode="Offline">
                  {(close) => <MatchRules valid={offlineMatchRules} timeoutForfeit setRulesRead={close} />}
                </RuleDisclosure>
                <RuleDisclosure title="Game Rules" mode="Offline">
                  {(close) => <MatchMoves setMovesRead={close} />}
                </RuleDisclosure>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-rose-50 p-3 text-rose-500 dark:bg-rose-950/60 dark:text-rose-300">
                    <Globe2 aria-hidden="true" className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Coming soon</span>
                    <h3 className="mt-2 text-2xl font-bold">Online match</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Play with friends or find an opponent through matchmaking.</p>
                  </div>
                </div>
                <button type="button" disabled className="mt-7 min-h-14 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  Online play coming soon
                </button>
                <p className="mb-2 mt-8 text-xs font-bold uppercase tracking-wider text-slate-400">Explore the rules</p>
                <RuleDisclosure title="Match Rules" mode="Online">
                  {(close) => <MatchRules valid={onlineMatchRules} setRulesRead={close} />}
                </RuleDisclosure>
                <RuleDisclosure title="Game Rules" mode="Online">
                  {(close) => <MatchMoves setMovesRead={close} />}
                </RuleDisclosure>
              </article>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Homepage;

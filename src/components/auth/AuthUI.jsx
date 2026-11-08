import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { GenerateRandomItem } from "./GenerateRandomItem";
import DarkModeToggler from "../DarkModeToggler";

const AuthUI = ({
  register,
  handleSubmit,
  signIn,
  signUp,
  formErrors,
  loginRequired,
  isFlipped,
  setIsFlipped,
  googleLogin,
}) => {
  const [items, setItems] = useState([]);
  const reducedMotion = useReducedMotion();
  const [displayedSignIn, setDisplayedSignIn] = useState(isFlipped);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (displayedSignIn === isFlipped) {
      setFlipping(false);
      return;
    }
    if (reducedMotion) {
      setDisplayedSignIn(isFlipped);
      setFlipping(false);
      return;
    }
    setFlipping(true);
    const timer = setTimeout(() => {
      setDisplayedSignIn(isFlipped);
      setFlipping(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [isFlipped, displayedSignIn, reducedMotion]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let interval;
    const updateAnimation = () => {
      clearInterval(interval);
      if (preference.matches) {
        setItems([]);
        return;
      }
      interval = setInterval(() => {
        setItems((previous) => [...previous, GenerateRandomItem()]);
      }, 1500);
    };
    updateAnimation();
    preference.addEventListener("change", updateAnimation);
    return () => {
      clearInterval(interval);
      preference.removeEventListener("change", updateAnimation);
    };
  }, []);

  const inputStyle =
    "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-indigo-900 md:py-2.5";
  const errorMessage =
    formErrors instanceof Error
      ? formErrors.message
      : typeof formErrors === "string"
        ? formErrors
        : formErrors
          ? "Google sign-in failed. Please try again."
          : "";

  return (
    <main className="relative w-full min-w-0 min-h-dvh overflow-hidden bg-[#f8f8fc] text-slate-900 dark:bg-slate-950 dark:text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden bg-[length:80px_80px] bg-[linear-gradient(to_right,rgba(99,102,241,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.07)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]"
      >
        {items.map((item) => (
          <span
            key={item.id}
            onAnimationEnd={() =>
              setItems((previous) =>
                previous.filter((entry) => entry.id !== item.id),
              )
            }
            className={`fade-out absolute p-2 text-6xl font-bold ${item.type === "X" ? "text-blue-500/40 dark:text-blue-400/40" : "text-red-500/40 dark:text-red-400/40"}`}
            style={{ left: `${item.X * 80}px`, top: `${item.Y * 80}px` }}
          >
            {item.type}
          </span>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-900/30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-rose-100/70 blur-3xl dark:bg-fuchsia-900/20"
      />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 pb-10 sm:px-8 md:pb-3">
        <header className="flex items-center justify-between gap-4 py-2">
          <Link
            to="/"
            className="inline-flex mt-2 items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to home
          </Link>
        </header>
        <div className="flex flex-1 flex-col justify-center gap-8 pb-6 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-8 md:pb-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
          <div className="w-full max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-indigo-700 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300">
              <Sparkles aria-hidden="true" className="h-4 w-4" /> Tic Tac Twist
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight lg:text-5xl">
              Ready for your{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                next move?
              </span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-600 dark:text-slate-300">
              Sign in or create an account to get started.
            </p>
          </div>
          <div className="w-full max-w-md self-center justify-self-center" style={{ perspective: "1200px" }}>
            <section
              aria-labelledby="auth-title"
              inert={flipping}
              style={{ transform: flipping ? "rotateY(90deg)" : "rotateY(0deg)" }}
              className={`w-full rounded-3xl border border-slate-200
  bg-gradient-to-tr from-white/70 via-slate-300/50 to-slate-900
  p-6 shadow-[0_24px_70px_-35px_rgba(67,56,202,0.4)]
  dark:border-slate-700
  dark:bg-gradient-to-tr dark:from-slate-900/50 dark:via-slate-700/50 dark:to-amber-300
  sm:p-8 md:p-6 motion-safe:transition-transform motion-safe:duration-[250ms] motion-safe:ease-in-out`}
            >
            <div className="flex justify-around">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
                  {displayedSignIn ? "Welcome back" : "Get started"}
                </p>
                <h2 id="auth-title" className="mt-2 text-2xl font-bold">
                  {displayedSignIn ? "Sign in" : "Create your account"}
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {displayedSignIn
                    ? "Enter your details to continue."
                    : "Choose a username and join the game."}
                </p>
              </div>
              <div>
                <DarkModeToggler />
              </div>
            </div>

            {errorMessage && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
              >
                {errorMessage}
              </p>
            )}
            {loginRequired && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
              >
                Please create an account to play, or sign in if you already have one.
              </p>
            )}

            <form
              key={displayedSignIn ? "signin" : "signup"}
              onSubmit={handleSubmit(displayedSignIn ? signIn : signUp)}
              className="mt-6 space-y-4 md:mt-4 md:space-y-3"
            >
              {displayedSignIn ? (
                <>
                  <label
                    htmlFor="loginEmail"
                    className="block text-sm font-semibold"
                  >
                    Email
                    <input
                      {...register("loginEmail")}
                      type="email"
                      id="loginEmail"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={inputStyle}
                    />
                  </label>
                  <label
                    htmlFor="loginPassword"
                    className="block text-sm font-semibold"
                  >
                    Password
                    <input
                      {...register("loginPassword")}
                      type="password"
                      id="loginPassword"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className={inputStyle}
                    />
                  </label>
                </>
              ) : (
                <>
                  <label
                    htmlFor="registerEmail"
                    className="block text-sm font-semibold"
                  >
                    Email
                    <input
                      {...register("registerEmail")}
                      type="email"
                      id="registerEmail"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={inputStyle}
                    />
                  </label>
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold"
                  >
                    Username
                    <input
                      {...register("username")}
                      type="text"
                      id="username"
                      autoComplete="username"
                      placeholder="Choose a username"
                      className={inputStyle}
                    />
                  </label>
                  <label
                    htmlFor="registerPassword"
                    className="block text-sm font-semibold"
                  >
                    Password
                    <input
                      {...register("registerPassword")}
                      type="password"
                      id="registerPassword"
                      autoComplete="new-password"
                      placeholder="Create a password"
                      className={inputStyle}
                    />
                  </label>
                </>
              )}
              <button
                type="submit"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {displayedSignIn ? "Sign in" : "Sign up"}{" "}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400 md:my-4">
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" /> or{" "}
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>
            <button
              type="button"
              onClick={googleLogin}
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span
                aria-hidden="true"
                className="text-lg font-black text-indigo-600 dark:text-indigo-400"
              >
                G
              </span>{" "}
              Continue with Google
            </button>
            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400 md:mt-4">
              {displayedSignIn ? "New here?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsFlipped(!displayedSignIn)}
                className="rounded font-bold text-indigo-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-indigo-400"
              >
                {displayedSignIn ? "Sign up" : "Sign in"}
              </button>
            </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AuthUI;

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Sparkles, X } from "lucide-react";
import { availableMoveTypes, canSelectMove } from "../utils/moveSelection";

const MobileMovePicker = ({
  currentPlayerPoints, selectedMoveType, setSelectedMoveType,
  selectedMovePattern, setSelectedMovePattern, specialMoveCost,
  movePatterns, emptyPatternMoveDescription, moveDescriptions,
  isTwistActive, disabled,
}) => {
  const [step, setStep] = useState(null);
  const [position, setPosition] = useState(null);
  const movesDialog = useRef(null);
  const patternDialog = useRef(null);
  const buttonRef = useRef(null);
  const drag = useRef(null);
  const suppressClick = useRef(false);

  const clampPosition = (x, y) => {
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(x, Math.max(0, window.innerWidth - rect.width))),
      y: Math.max(0, Math.min(y, Math.max(0, window.innerHeight - rect.height))),
    };
  };

  useEffect(() => {
    const clampOnResize = () => {
      setPosition((previous) => previous ? clampPosition(previous.x, previous.y) : null);
    };
    window.addEventListener("resize", clampOnResize);
    return () => window.removeEventListener("resize", clampOnResize);
  }, []);

  useEffect(() => {
    const moves = movesDialog.current;
    const pattern = patternDialog.current;
    if (moves?.open && step !== "moves") moves.close();
    if (pattern?.open && step !== "pattern") pattern.close();
    if (step === "moves" && !moves.open) moves.showModal();
    if (step === "pattern" && !pattern.open) pattern.showModal();
  }, [step]);

  useEffect(() => {
    if (disabled) setStep(null);
  }, [disabled]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = (event) => {
      if (event.matches) setStep(null);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const selectMove = (type) => {
    if (!canSelectMove(type, currentPlayerPoints, specialMoveCost, isTwistActive, disabled)) return;
    if (type === "PATTERN_BOMB") {
      setStep("pattern");
    } else {
      setSelectedMoveType(type);
      setSelectedMovePattern("NONE");
      setStep(null);
    }
  };

  const dialogClass = "fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl backdrop:bg-slate-950/60 dark:border-slate-700 dark:bg-slate-900 dark:text-white";
  const closeClass = "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800";

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Choose a move"
        aria-description="Drag to reposition, or use arrow keys while focused."
        aria-haspopup="dialog"
        aria-disabled={disabled}
        ref={buttonRef}
        style={position ? { left: position.x, top: position.y, bottom: "auto" } : undefined}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          const rect = event.currentTarget.getBoundingClientRect();
          drag.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: rect.left, y: rect.top, moved: false };
          suppressClick.current = false;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const active = drag.current;
          if (!active || active.id !== event.pointerId) return;
          const dx = event.clientX - active.startX;
          const dy = event.clientY - active.startY;
          if (Math.hypot(dx, dy) > 5) active.moved = true;
          if (active.moved) setPosition(clampPosition(active.x + dx, active.y + dy));
        }}
        onPointerUp={(event) => {
          if (drag.current?.id !== event.pointerId) return;
          suppressClick.current = drag.current.moved;
          drag.current = null;
        }}
        onPointerCancel={() => { drag.current = null; suppressClick.current = false; }}
        onKeyDown={(event) => {
          const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
          const direction = directions[event.key];
          if (!direction) return;
          event.preventDefault();
          const rect = event.currentTarget.getBoundingClientRect();
          setPosition(clampPosition(rect.left + direction[0] * 24, rect.top + direction[1] * 24));
        }}
        onClick={() => {
          if (suppressClick.current) { suppressClick.current = false; return; }
          if (!disabled) setStep("moves");
        }}
        className={`fixed bottom-5 left-3 z-30 flex h-14 w-14 touch-none items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:ring-slate-900/80 ${disabled ? "bg-slate-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
      >
        <Sparkles aria-hidden="true" className="h-6 w-6" />
      </button>
      <dialog ref={movesDialog} aria-labelledby="mobile-moves-title" className={dialogClass} onCancel={(event) => { event.preventDefault(); setStep(null); }}>
        <div className="flex items-center justify-between gap-3">
          <h2 id="mobile-moves-title" className="text-xl font-bold">Choose a move</h2>
          <button type="button" aria-label="Close move selection" className={closeClass} onClick={() => setStep(null)}><X aria-hidden="true" /></button>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Available points: {currentPlayerPoints ?? 0}</p>
        <div className="mt-4 grid gap-2">
          {availableMoveTypes.map((type) => {
            const affordable = canSelectMove(type, currentPlayerPoints, specialMoveCost, isTwistActive, disabled);
            return (
              <button key={type} type="button" disabled={!affordable}
                aria-pressed={selectedMoveType === type}
                onClick={() => selectMove(type)}
                className={`flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 py-2 text-left font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 ${
                  !affordable
                    ? "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    : type !== "NORMAL"
                      ? `border-green-400 bg-green-100 text-green-900 dark:border-green-700 dark:bg-green-900 dark:text-green-100 ${selectedMoveType === type ? "ring-2 ring-indigo-600 dark:ring-indigo-400" : ""}`
                      : selectedMoveType === type ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950" : "border-slate-200 dark:border-slate-700"
                }`}>
                <span>{type.replaceAll("_", " ")}</span>
                <span className="shrink-0 text-sm">{specialMoveCost.get(type)} pts</span>
              </button>
            );
          })}
        </div>
        {isTwistActive && <p className="mt-3 text-sm text-indigo-700 dark:text-indigo-300">Twist is unavailable while a twist is active.</p>}
        {selectedMoveType !== "PATTERN_BOMB" && moveDescriptions.get(selectedMoveType) && (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{moveDescriptions.get(selectedMoveType)}</p>
        )}
      </dialog>
      <dialog ref={patternDialog} aria-labelledby="mobile-pattern-title" className={dialogClass} onCancel={(event) => { event.preventDefault(); setStep(null); }}>
        <div className="flex items-center justify-between gap-3">
          <h2 id="mobile-pattern-title" className="text-xl font-bold">Choose a pattern</h2>
          <button type="button" aria-label="Close pattern selection" className={closeClass} onClick={() => setStep(null)}><X aria-hidden="true" /></button>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Choose what your pattern bomb will clear.</p>
        <div className="mt-4 grid gap-2">
          {movePatterns.map((pattern) => (
            <button key={pattern} type="button" disabled={disabled}
              aria-pressed={selectedMoveType === "PATTERN_BOMB" && selectedMovePattern === pattern}
              onClick={() => {
                setSelectedMovePattern(pattern);
                setSelectedMoveType("PATTERN_BOMB");
                setStep(null);
              }}
              className="min-h-12 rounded-xl border border-slate-200 px-4 py-2 text-left hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:hover:bg-indigo-950">
              <span className="block font-semibold">{pattern.replaceAll("_", " ")}</span>
              <span className="block text-sm text-slate-600 dark:text-slate-300">{emptyPatternMoveDescription.get(pattern)}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setStep("moves")} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-semibold text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:text-indigo-300"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to moves</button>
      </dialog>
    </div>
  );
};

export default MobileMovePicker;

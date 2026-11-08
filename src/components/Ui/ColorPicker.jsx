import { useState } from "react";
import { colors } from "../utils/colors";

const ColorPicker = ({
  setPlayer1Color,
  setPlayer2Color,
  player1Color,
  player2Color,
  player1,
  player2,
}) => {
  const [turn, setTurn] = useState(1); // 1 = player1, 2 = player2
  const [selectedColor, setSelectedColor] = useState(null); // temp highlight

  const pickColor = (id) => {
    setSelectedColor(id);
  };

  const handleConfirm = () => {
    if (!selectedColor) return;

    if (turn === 1) {
      setPlayer1Color(selectedColor);
      setTurn(2);
    } else {
      setPlayer2Color(selectedColor);
      setTurn(1);
    }

    setSelectedColor(null); // reset selection for next player
  };

  const players = [
    { name: player1 || "Player 1", color: player1Color, number: 1 },
    { name: player2 || "Player 2", color: player2Color, number: 2 },
  ];

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="grid w-full grid-cols-2 gap-3" aria-label="Player color previews">
        {players.map(({ name, color, number }) => {
          const previewColor = !color && turn === number ? selectedColor : color;
          const colorName = colors.find((item) => item.className === previewColor)?.id;
          const status = color ? "Confirmed" : previewColor ? "Preview" : "Not selected";

          return (
            <div key={number} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
              <p className="truncate text-sm font-semibold" title={name}>{name}</p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`h-9 w-9 shrink-0 rounded-lg border border-slate-300 dark:border-slate-600 ${previewColor || "bg-white dark:bg-slate-900"}`}
                />
                <div className="min-w-0 text-xs">
                  <p className="font-semibold capitalize">{colorName || "No color"}</p>
                  <p className="text-slate-500 dark:text-slate-400">{status}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-3 w-full">
        {colors.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-label={`Select ${c.id}`}
            aria-pressed={selectedColor === c.className}
            disabled={player1Color !== "" && player2Color !== ""}
            onClick={() => pickColor(c.className)}
            className={`
              rounded-xl h-12 cursor-pointer border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed
              ${c.className}
              transition transform hover:scale-[1.05]
              flex justify-center items-center
              
              ${
                // highlight if this color is currently selected
                selectedColor === c.className
                  ? "border-white ring-2 ring-indigo-600 shadow-lg"
                  : "border-transparent"
              }
            `}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={!selectedColor || (player1Color !== "" && player2Color !== "")}
        className="min-h-11 w-full rounded-xl border border-indigo-200 px-4 py-2 font-semibold text-indigo-700 transition hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950"
      >
        Confirm
      </button>
    </div>
  );
};

export default ColorPicker;

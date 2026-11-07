import React, { useState } from "react";
import { colors } from "../utils/colors";

const ColorPicker = ({
  setPlayer1Color,
  setPlayer2Color,
  player1Color,
  player2Color,
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

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="grid grid-cols-3 gap-3 w-full">
        {colors.map((c) => (
          <div
            key={c.id}
            onClick={() => pickColor(c.className)}
            className={`
              rounded-lg h-14 cursor-pointer border-2 
              ${c.className}
              transition transform hover:scale-[1.08] 
              flex justify-center items-center
              
              ${
                // highlight if this color is currently selected
                selectedColor === c.className
                  ? "border-white shadow-lg scale-[1.15]"
                  : "border-transparent"
              }
            `}
          ></div>
        ))}
      </div>

      <button
        onClick={handleConfirm}
        disabled={player1Color !== "" && player2Color !== ""}
        className={`p-2 bg-blue-400 rounded-xl shadow-xl ${
          player1Color !== "" && player2Color !== ""
            ? "cursor-not-allowed scale-75"
            : "cursor-pointer scale-105 "
        }
                   transition-transform duration-500 hover:scale-105 w-1/2`}
      >
        Confirm
      </button>
    </div>
  );
};

export default ColorPicker;

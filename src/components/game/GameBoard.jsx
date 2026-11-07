import React, { useState } from "react";
import WebSocketGameBoard from "../../webSocket/webSocketService";
import { useLocation, useNavigate } from "react-router-dom";
import RockPaperScissor from "../Ui/RockPaperScissor";
const GameBoard = () => {
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [player1Symbol, setPlayer1Symbol] = useState("");
  const [player2Symbol, setPlayer2Symbol] = useState("");
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [currentPlayerSymbol, setCurrentPlayerSymbol] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state) {
    navigate("/onlinePVPPage");
    return <p>Redirecting...</p>;
  }
  const { player1Username, player2Username } = location.state;
  // Clear and grouped logs for debugging
  console.log("=== GameBoard State ===");
  console.log("Current Player:", currentPlayer);
  console.log("Player 1 Username:", player1);
  console.log("Player 2 Username:", player2);
  console.log("Player 1 Symbol:", player1Symbol);
  console.log("Player 2 Symbol:", player2Symbol);
  console.log("========================");
  return (
    <div>
      {!player1Symbol && !player2Symbol && (
        <RockPaperScissor
          player1Username={player1Username}
          player2Username={player2Username}
          setPlayer1Symbol={setPlayer1Symbol}
          setPlayer2Symbol={setPlayer2Symbol}
          setCurrentPlayer={setCurrentPlayer}
          setPlayer1={setPlayer1}
          setPlayer2={setPlayer2}
          setCurrentPlayerSymbol={setCurrentPlayerSymbol}
        />
      )}
      {currentPlayer &&
        player1Symbol &&
        player2Symbol &&
        player1 &&
        player2 &&
        currentPlayerSymbol && (
          <WebSocketGameBoard
            player1Username={player1}
            player2Username={player2}
            player1Symbol={player1Symbol}
            player2Symbol={player2Symbol}
            currentPlayer={currentPlayer}
            currentPlayerSymbol={currentPlayerSymbol}
          />
        )}
    </div>
  );
};

export default GameBoard;

import React, { useState } from "react";
import WebSocketGameBoard from "../../webSocket/webSocketService";
import { Navigate, useLocation } from "react-router-dom";
import RockPaperScissor from "../Ui/RockPaperScissor";
const GameBoard = () => {
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [player1Symbol, setPlayer1Symbol] = useState("");
  const [player2Symbol, setPlayer2Symbol] = useState("");
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [currentPlayerSymbol, setCurrentPlayerSymbol] = useState("");

  const location = useLocation();
  if (!location.state) {
    return <Navigate to="/onlinePVPPage" replace />;
  }
  const { player1Username, player2Username } = location.state;
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

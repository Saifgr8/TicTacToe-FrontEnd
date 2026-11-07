import React from "react";

export const GenerateRandomItem = () => {
  const GRID_SIZE = 80;
  const GRID_HEIGHT = window.innerHeight;
  const GRID_WIDTH = window.innerWidth;
  const xCount = Math.floor(GRID_WIDTH / GRID_SIZE);
  const yCount = Math.floor(GRID_HEIGHT / GRID_SIZE);

  return {
    id: Date.now() + Math.random(),
    type: Math.random() > 0.5 ? "X" : "O",
    X: Math.floor(Math.random() * xCount),
    Y: Math.floor(Math.random() * yCount),
    visible: true,
  };
};

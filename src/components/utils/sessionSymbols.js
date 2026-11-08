export function getPlayerSymbols(session, previewTwist = false) {
  if (!session) return null;

  const { player1Symbol, player2Symbol, twistActive } = session;
  if (!player1Symbol || !player2Symbol) return null;

  return twistActive || previewTwist
    ? { player1: player2Symbol, player2: player1Symbol }
    : { player1: player1Symbol, player2: player2Symbol };
}

export function getCurrentPlayerSymbol(session, player1Username, player2Username, previewTwist = false) {
  const symbols = getPlayerSymbols(session, previewTwist);
  if (!symbols || !session.currentPlayer) return null;

  if (session.currentPlayer === player1Username) return symbols.player1;
  if (session.currentPlayer === player2Username) return symbols.player2;
  return null;
}

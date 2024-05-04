import type { IGameState } from "./types";

const winConditions: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const isValidMove = (index: number, board: number[]) => {
  return index >= 0 && index < board.length && board[index] === 0;
};

export const isVictory = (board: number[], playerId: number): boolean => {
  const indices = board
    .map((value, i) => (value === playerId ? i : -1))
    .filter((index) => index !== -1);
  return winConditions.some((winCondition) =>
    winCondition.every((index) => indices.includes(index))
  );
};

export const isDraw = (board: number[]) => board.every((cell) => cell !== 0);

export const doMove = (
  gameState: IGameState,
  index: number,
  playerId: number
) => {
  if (
    gameState.ctx.currentPlayer !== playerId ||
    !isValidMove(index, gameState.board)
  )
    return gameState;
  gameState.board[index] = playerId;
  return gameState;
};

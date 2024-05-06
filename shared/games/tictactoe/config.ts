import type { IGameConfig } from "../../config";
import Board from "./Board";
import { isValidMove } from "./logic";
import type { IGameState } from "./types";

const config: IGameConfig = {
  Board,
  game: {
    initialState: {
      players: {},
      board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ctx: {
        currentPlayer: 1,
        numPlayers: 2,
      },
    } as IGameState,
    moves: {
      clickCell: (gameState: IGameState, playerId: number, index: number) => {
        if (
          gameState.ctx.currentPlayer !== playerId ||
          !isValidMove(index, gameState.board)
        )
          return;
        gameState.board[index] = playerId;
      },
    },
  },
};

export default config;

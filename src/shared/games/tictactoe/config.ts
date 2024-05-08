import type { IGameConfig } from "../../types";
import Board from "./board";
import { isDraw, isValidMove, isVictory } from "./logic";
import type { IGameState, IMoves } from "./types";

const config: IGameConfig<IGameState, IMoves> = {
  Board,
  flow: {
    initialState: {
      players: {},
      board: Array(9).fill(0),
    },
    moves: {
      clickCell: ({ G }, playerId, index) => {
        if (!isValidMove(index, G.board)) return;
        G.board[index] = playerId;
      },
    },
    onMove({ G, ctx }, playerId) {
      if (isVictory(G.board, playerId)) {
        ctx.winner = playerId;
      } else if (isDraw(G.board)) {
        ctx.winner = 0;
      }
      ctx.currentPlayer = 1 + (ctx.currentPlayer % 2);
    },
  },
};

export default config;

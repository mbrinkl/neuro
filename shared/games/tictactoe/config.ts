import type { IGameConfig } from "../../config";
import Board from "./board";
import { isValidMove } from "./logic";
import type { IGameState, IMoves } from "./types";

const config: IGameConfig<IGameState, IMoves> = {
  Board,
  gameStructure: {
    initialState: {
      players: {},
      board: Array(9).fill(0),
    },
    moves: {
      clickCell: ({ G, ctx }, playerId, index) => {
        if (ctx.currentPlayer !== playerId || !isValidMove(index, G.board)) return;
        G.board[index] = playerId;
      },
    },
  },
};

export default config;

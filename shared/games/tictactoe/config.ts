import type { IGame, IGameConfig } from "../../config";
import Board from "./Board";
import { isValidMove } from "./logic";
import type { IGameState } from "./types";

const config: IGameConfig<IGameState> = {
  Board,
  gameStructure: {
    initialState: {
      players: {},
      board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    moves: {
      clickCell: ({ G, ctx }: IGame<IGameState>, playerId: number, index: number) => {
        if (ctx.currentPlayer !== playerId || !isValidMove(index, G.board)) return;
        G.board[index] = playerId;
      },
    },
  },
};

export default config;

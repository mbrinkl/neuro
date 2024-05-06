import type { IGame, IGameConfig } from "../../config";
import Board from "./Board";
import { isValidMove } from "./logic";
import type { IGameState } from "./types";

const config: IGameConfig<IGameState> = {
  Board,
  gameStructure: {
    initialState: {
      players: {},
      board: Array(9).fill(0),
    },
    moves: {
      clickCell: ({ G }: IGame<IGameState>, playerId: number, index: number) => {
        if (!isValidMove(index, G.board)) return;
        G.board[index] = playerId;
      },
    },
  },
};

export default config;

import games from "./games";
import type { IGameState } from "./games/tictactoe/types";

export interface IGameDef {
  id: string;
  name: string;
  //config: () => Promise<any>;
  config: IGameConfig;
}

export interface IGameConfig {
  Board: any;
  game: {
    initialState: IGameState;
    moves: { [key: string]: (...args: any[]) => void };
  };
}

export const gameDefs: IGameDef[] = Object.values(games);

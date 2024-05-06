import games from "./games";

export interface IGameMessage {
  type: string;
  args: unknown[];
}

export interface IGameState {
  players: Record<string, IPlayer>;
  board: number[];
  ctx: IGameContext;
  winner?: number;
}

export interface IGameContext {
  currentPlayer: number;
  numPlayers: number;
}

export interface IPlayer {
  id: number;
  isConnected: boolean;
}

export interface IGameDef {
  id: string;
  name: string;
  //config: () => Promise<any>;
  config: IGameConfig;
}

export interface IBoardContext {
  gameState: IGameState;
  playerId: number;
  moves: Record<string, (args: unknown[]) => void>;
}

export interface IGameConfig {
  Board: React.ComponentType<IBoardContext>;
  game: {
    initialState: IGameState;
    moves: Record<string, (...args: unknown[]) => void>;
  };
}

export const gameDefs: IGameDef[] = Object.values(games);

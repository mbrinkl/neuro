import games from "./games";

export interface IGame<T extends IBaseGameState = any> {
  G: T;
  ctx: IGameContext;
}

export interface IGameMessage {
  type: string;
  args: unknown[];
}

export interface IBaseGameState {
  players: Record<string, IBasePlayer>;
}

export interface IBasePlayer {
  id: number;
  isConnected: boolean;
}

export interface IGameContext {
  currentPlayer: number;
  numPlayers: number;
  winner?: number;
}

export interface IGameDef {
  id: string;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  //config: () => Promise<any>;
  config: IGameConfig;
}

export interface IBoardContext<T = any> {
  G: T;
  ctx: IGameContext;
  playerId: number;
  moves: Record<string, (args: unknown[]) => void>;
}

export interface IGameConfig<T = any> {
  Board: React.ComponentType<IBoardContext>;
  gameStructure: {
    initialState: T;
    moves: Record<string, (...args: unknown[]) => void>;
  };
}

export const gameDefs: IGameDef[] = Object.values(games);

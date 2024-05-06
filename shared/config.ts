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

export interface IBoardContext<T extends IBaseGameState = any, S extends IBaseMoves = any> {
  G: T;
  ctx: IGameContext;
  playerId: number;
  moves: S;
}

export interface IGameDef {
  id: string;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  //config: () => Promise<any>;
  config: IGameConfig;
}

export type IBaseMoves = Record<string, (...args: any[]) => void>;

export interface IGameConfig<T extends IBaseGameState = any, S extends IBaseMoves = any> {
  Board: React.ComponentType<IBoardContext>;
  gameStructure: {
    initialState: T;
    moves: {
      [K in keyof S]: (game: IGame<T>, playerId: number, ...args: Parameters<S[K]>) => void;
    };
  };
}

export const gameDefs: IGameDef[] = Object.values(games);

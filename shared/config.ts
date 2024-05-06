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

export interface IGameFlow<T extends IBaseGameState = any, S extends IBaseMoves = any> {
  initialState: T;
  moves: {
    [K in keyof S]: (game: IGame<T>, playerId: number, ...args: Parameters<S[K]>) => void;
  };
  onMove?: (game: IGame<T>, playerId: number) => void;
}

export type IBaseMoves = Record<string, (...args: any[]) => void>;

export interface IGameConfig<T extends IBaseGameState = any, S extends IBaseMoves = any> {
  Board: React.ComponentType<IBoardContext>;
  flow: IGameFlow<T, S>;
}

export const gameDefs: IGameDef[] = Object.values(games);

export const getGameRoomId = (gameId: string, roomId: string) => {
  return gameId + "-" + roomId;
};

export const executeMove = (game: IGame, moveId: string, flow: IGameFlow, senderId: string, moveArgs: unknown[]) => {
  const player = game.G.players[senderId];
  const { moves } = flow;
  const move = moves[moveId];

  if (!player) {
    throw new Error("Invalid Sender");
  }

  if (move === undefined) {
    throw new Error("Invalid move id: " + moveId);
  }

  if (game.ctx.currentPlayer !== player.id) {
    throw new Error("Not player " + player.id + "'s turn");
  }

  move(game, player.id, ...moveArgs);

  flow.onMove?.(game, player.id);
};

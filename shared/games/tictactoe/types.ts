export interface IGameMessage {
  type: string;
  args: any;
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

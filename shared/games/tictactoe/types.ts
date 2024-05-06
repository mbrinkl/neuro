import type { IBaseGameState } from "../../config";

export interface IPlayer {
  id: number;
  isConnected: boolean;
}

export interface IGameState extends IBaseGameState {
  players: Record<string, IPlayer>;
  board: number[];
}

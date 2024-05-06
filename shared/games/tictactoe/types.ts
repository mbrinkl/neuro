import type { IBaseGameState, IBaseMoves, IBasePlayer } from "../../config";

export interface IMoves extends IBaseMoves {
  clickCell: (index: number) => void;
}

export interface IGameState extends IBaseGameState {
  players: Record<string, IBasePlayer>;
  board: number[];
}

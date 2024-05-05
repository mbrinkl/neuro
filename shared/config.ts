import games from "./games";

export interface IGameDef {
  id: string;
  name: string;
  config: () => Promise<any>;
}

export const gameDefs: IGameDef[] = Object.values(games);

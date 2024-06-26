import type { IGameDef } from "../../types";
import config from "./config";

export const def: IGameDef = {
  id: "tictactoe",
  name: "TicTacToe",
  minPlayers: 2,
  maxPlayers: 2,
  config,
  // config: () => import("./config"),
};

export default def;

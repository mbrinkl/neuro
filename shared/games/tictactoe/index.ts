import type { IGameDef } from "../../config";
import config from "./config";

export const def: IGameDef = {
  id: "tictactoe",
  name: "TicTacToe",
  config,
  // config: () => import("./config"),
};

export default def;

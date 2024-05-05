import type { IGameDef } from "../../config";

export const def: IGameDef = {
  id: "tictactoe",
  name: "TicTacToe",
  config: () => import("./config"),
};

export default def;

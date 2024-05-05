import type { IGameDef } from "../../config";

const def: IGameDef = {
  id: "connectfour",
  name: "Connect 4",
  config: () => import("../tictactoe/config"),
};

export default def;

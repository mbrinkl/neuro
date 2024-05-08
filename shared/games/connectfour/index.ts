import type { IGameDef } from "../../config";
import config from "../tictactoe/config";

const def: IGameDef = {
  id: "connectfour",
  name: "Connect 4",
  config: config,
  minPlayers: 2,
  maxPlayers: 4,
  setup: [],
};

export default def;

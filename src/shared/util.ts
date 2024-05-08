import games from "./games";
import type { IGame, IGameDef, IGameFlow } from "./types";

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

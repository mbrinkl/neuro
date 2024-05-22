import type { ILobbyRoom } from "./lobby";

export const createRoom = (gameId: string, userId: string, numPlayers: number, isPrivate: boolean): ILobbyRoom => {
  const roomId = (Math.random() + 1).toString(36).substring(7);
  const room: ILobbyRoom = {
    gameId,
    roomId,
    numPlayers,
    state: isPrivate ? "private" : "public",
    players: [{ id: userId, name: "CreatorNoob" }],
  };
  return room;
};

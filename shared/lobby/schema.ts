import z from "zod";

export const LobbyRoomsResponse = z.object({
  type: z.literal("rooms"),
  rooms: z.string().array(),
});

export const LobbyCreateRequest = z.object({
  type: z.literal("create"),
  gameId: z.string(),
});

export const LobbyCreateResponse = z.object({
  type: z.literal("create"),
  gameId: z.string(),
  roomId: z.string(),
});

export const LobbyRequest = LobbyCreateRequest;
export const LobbyResponse = z.union([LobbyRoomsResponse, LobbyCreateResponse]);

export type ILobbyRoomsResponse = z.infer<typeof LobbyRoomsResponse>;
export type ILobbyCreateRequest = z.infer<typeof LobbyCreateRequest>;
export type ILobbyCreateResponse = z.infer<typeof LobbyCreateResponse>;

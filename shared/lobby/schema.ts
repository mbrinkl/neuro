import z from "zod";

export const LobbyCreateRequest = z.object({
  type: z.literal("create"),
  gameId: z.string(),
  numPlayers: z.number(),
});

export const LobbyCreateResponse = z.object({
  type: z.literal("create"),
  gameId: z.string(),
  roomId: z.string(),
  players: z.string().array(),
});

export const LobbyJoinRequest = z.object({
  type: z.literal("join"),
  roomId: z.string(),
});

export const LobbyLeaveRequest = z.object({
  type: z.literal("leave"),
  roomId: z.string(),
});

export const LobbyJoinLeaveResponse = z.object({
  type: z.literal("join_leave"),
  players: z.string().array(),
  started: z.boolean(),
});

export const LobbyConnectResponse = z.object({
  type: z.literal("connect"),
  userId: z.string(),
  rooms: z.string().array(),
});

export const LobbyRequest = z.union([LobbyCreateRequest, LobbyJoinRequest, LobbyLeaveRequest]);
export const LobbyResponse = z.union([LobbyCreateResponse, LobbyJoinLeaveResponse, LobbyConnectResponse]);

export type ILobbyCreateRequest = z.infer<typeof LobbyCreateRequest>;
export type ILobbyCreateResponse = z.infer<typeof LobbyCreateResponse>;
export type ILobbyConnectResponse = z.infer<typeof LobbyConnectResponse>;
export type ILobbyJoinLeaveResponse = z.infer<typeof LobbyJoinLeaveResponse>;
export type ILobbyJoinRequest = z.infer<typeof LobbyJoinRequest>;

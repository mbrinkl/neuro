import type * as Party from "partykit/server";
import {
  LobbyRequest,
  type ILobbyConnectResponse,
  type ILobbyCreateResponse,
  type ILobbyJoinLeaveResponse,
} from "../shared/lobby/schema";

export default class Lobby implements Party.Server {
  // options: Party.ServerOptions = {
  //   hibernate: true,
  // };

  // connectionId: userId
  connections: Record<string, string>;

  rooms: {
    gameId: string;
    roomId: string;
    numPlayers: number;
    state: "open" | "started";
    players: {
      id: string;
      name: string;
    }[];
  }[];

  constructor(readonly room: Party.Room) {
    this.connections = {};
    this.rooms = [];
  }

  async onRequest(request: Party.Request) {
    // read from storage
    // this.connections = this.connections ?? (await this.room.storage.get("connections")) ?? {};

    if (request.method === "GET") {
      const startedGames = this.rooms.filter((room) => room.state === "started");
      return new Response(JSON.stringify(startedGames.map((g) => `${g.gameId}-${g.roomId}`)));
    }

    return new Response(null);
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    let userId = new URL(ctx.request.url).searchParams.get("userId") ?? "";
    if (!userId) {
      userId = (Math.random() + 1).toString(36).substring(2);
    }
    this.connections[conn.id] = userId;

    const response: ILobbyConnectResponse = {
      type: "connect",
      rooms: this.rooms.filter((room) => room.state === "open").map((x) => `${x.gameId}-${x.roomId}`),
      userId,
    };

    conn.send(JSON.stringify(response));
  }

  onClose(conn: Party.Connection) {
    // TODO: should leave any closed games first
    // but only if there is not another open connection
    // is there a race condtion in that scenario?

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.connections[conn.id];
  }

  onMessage(message: string, sender: Party.Connection) {
    const result = LobbyRequest.safeParse(JSON.parse(message));
    if (!result.success) return;

    const { data } = result;
    const userId = this.connections[sender.id];

    switch (data.type) {
      case "create":
        this.createGameLobbyRoom(data.gameId, userId, data.numPlayers);
        break;
      case "join":
        this.joinGameLobbyRoom("join", data.roomId, userId);
        break;
      case "leave":
        this.joinGameLobbyRoom("leave", data.roomId, userId);
        break;
    }
  }

  createGameLobbyRoom(gameId: string, userId: string, numPlayers: number) {
    const roomId = (Math.random() + 1).toString(36).substring(7);
    this.rooms.push({
      gameId,
      roomId,
      numPlayers,
      state: "open",
      players: [{ id: userId, name: "CreatorNoob" }],
    });
    const response: ILobbyCreateResponse = {
      type: "create",
      gameId,
      roomId,
      players: ["CreatorNoob"],
    };
    this.room.broadcast(JSON.stringify(response));
  }

  joinGameLobbyRoom(type: "join" | "leave", roomId: string, userId: string) {
    const room = this.rooms.find((room) => room.roomId === roomId);
    if (!room) {
      throw new Error("Couldn't find room");
    }
    if (room.state === "started") {
      throw new Error("Room already started");
    }

    const isUserInRoom = !!room.players.find((player) => player.id === userId);

    if (type === "join") {
      if (isUserInRoom) {
        return;
      }
      room.players.push({ id: userId, name: "Noob " });
    } else {
      if (!isUserInRoom) {
        return;
      }
      const index = room.players.findIndex((p) => p.id === userId);
      room?.players.splice(index, 1);
    }

    if (room.players.length === room.numPlayers) {
      room.state = "started";
    }

    const response: ILobbyJoinLeaveResponse = {
      type: "join_leave",
      players: room.players.map((player) => player.name),
      started: room.state === "started",
    };
    this.room.broadcast(JSON.stringify(response));
  }
}

Lobby satisfies Party.Worker;

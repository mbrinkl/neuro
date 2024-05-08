import type * as Party from "partykit/server";
import {
  LobbyRequest,
  type ILobbyConnectResponse,
  type ILobbyCreateResponse,
  type ILobbyJoinLeaveResponse,
} from "../shared/lobby/schema";

export default class Lobby implements Party.Server {
  options: Party.ServerOptions = {
    hibernate: true,
  };

  // connectionId: userId
  connections: Record<string, string> | null;

  rooms:
    | {
        gameId: string;
        roomId: string;
        numPlayers: number;
        state: "open" | "started";
        players: {
          id: string;
          name: string;
        }[];
      }[]
    | null;

  constructor(readonly room: Party.Room) {
    this.connections = null;
    this.rooms = null;
  }

  // Getters for hibernated room
  async getRooms() {
    return this.rooms ?? (await this.room.storage.get<typeof this.rooms>("rooms")) ?? [];
  }

  async getConnections() {
    return this.connections ?? (await this.room.storage.get<typeof this.connections>("connections")) ?? {};
  }

  async onRequest(request: Party.Request) {
    this.rooms = await this.getRooms();

    if (request.method === "GET") {
      const startedGames = this.rooms.filter((room) => room.state === "started");
      return new Response(JSON.stringify(startedGames.map((g) => `${g.gameId}-${g.roomId}`)));
    }

    return new Response(null);
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    this.connections = await this.getConnections();
    this.rooms = await this.getRooms();

    let userId = new URL(ctx.request.url).searchParams.get("userId") ?? "";
    if (!userId) {
      userId = (Math.random() + 1).toString(36).substring(2);
    }
    this.connections[conn.id] = userId;
    await this.room.storage.put("connections", this.connections);

    const response: ILobbyConnectResponse = {
      type: "connect",
      rooms: this.rooms.filter((room) => room.state === "open").map((x) => `${x.gameId}-${x.roomId}`),
      userId,
    };

    conn.send(JSON.stringify(response));
  }

  async onClose(conn: Party.Connection) {
    this.connections = await this.getConnections();
    // TODO: should leave any closed games first
    // but only if there is not another open connection
    // is there a race condtion in that scenario?

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.connections[conn.id];
    await this.room.storage.put("connections", this.connections);
  }

  async onMessage(message: string, sender: Party.Connection) {
    this.connections = (await this.room.storage.get<typeof this.connections>("connections")) ?? {};
    this.rooms = (await this.room.storage.get<typeof this.rooms>("rooms")) ?? [];

    const result = LobbyRequest.safeParse(JSON.parse(message));
    if (!result.success) return;

    const { data } = result;
    const userId = this.connections[sender.id];

    switch (data.type) {
      case "create":
        await this.createGameLobbyRoom(data.gameId, userId, data.numPlayers);
        break;
      case "join":
        this.joinGameLobbyRoom("join", data.roomId, userId);
        break;
      case "leave":
        this.joinGameLobbyRoom("leave", data.roomId, userId);
        break;
    }
  }

  async createGameLobbyRoom(gameId: string, userId: string, numPlayers: number) {
    this.rooms = await this.getRooms();

    const roomId = (Math.random() + 1).toString(36).substring(7);
    this.rooms.push({
      gameId,
      roomId,
      numPlayers,
      state: "open",
      players: [{ id: userId, name: "CreatorNoob" }],
    });
    await this.room.storage.put("rooms", this.rooms);
    const response: ILobbyCreateResponse = {
      type: "create",
      gameId,
      roomId,
      players: ["CreatorNoob"],
    };
    this.room.broadcast(JSON.stringify(response));
  }

  async joinGameLobbyRoom(type: "join" | "leave", roomId: string, userId: string) {
    this.rooms = await this.getRooms();

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
    await this.room.storage.put("rooms", this.rooms);

    const response: ILobbyJoinLeaveResponse = {
      type: "join_leave",
      players: room.players.map((player) => player.name),
      started: room.state === "started",
    };
    this.room.broadcast(JSON.stringify(response));
  }
}

Lobby satisfies Party.Worker;

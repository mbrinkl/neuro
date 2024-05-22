import type * as Party from "partykit/server";
import {
  LobbyRequest,
  type ILobbyConnectResponse,
  type ILobbyCreateResponse,
  type ILobbyJoinLeaveResponse,
} from "../shared/lobby/schema";
import { createRoom } from "./matchmaker";

export interface ILobbyRoom {
  gameId: string;
  roomId: string;
  numPlayers: number;
  state: "public" | "private" | "started" | "closed";
  players: {
    id: string;
    name: string;
  }[];
}

export default class Lobby implements Party.Server {
  options: Party.ServerOptions = {
    hibernate: true,
  };

  connections?: Record<string, string>;
  rooms?: ILobbyRoom[];

  constructor(readonly room: Party.Room) {}

  // async onStart() {
  //   this.room.storage.deleteAll();
  // }

  // Getters for hibernated room
  async getRooms() {
    return this.rooms ?? (await this.room.storage.get<typeof this.rooms>("rooms")) ?? [];
  }

  async getConnections() {
    return this.connections ?? (await this.room.storage.get<typeof this.connections>("connections")) ?? {};
  }

  async onRequest(request: Party.Request) {
    this.rooms = await this.getRooms();

    if (request.method === "POST") {
      const data = (await request.json()) as { gameId: string; roomId: string };
      const game = this.rooms.find(
        (room) => room.state === "started" && room.gameId === data.gameId && room.roomId === data.roomId,
      );
      return new Response(JSON.stringify(game ?? null));
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
      rooms: this.rooms.filter((room) => room.state === "public").map((x) => `${x.gameId}-${x.roomId}`),
      userId,
    };

    conn.send(JSON.stringify(response));
  }

  async onClose(conn: Party.Connection) {
    this.connections = await this.getConnections();
    this.rooms = await this.getRooms();

    const userId = this.connections[conn.id];

    // Skip room cleanup if multiple connected same user id
    // Race condition here? ie if user closes all tabs at once, what will happen
    const numTimesUserConnected = Object.values(this.connections).filter((x) => x === userId).length;

    if (numTimesUserConnected === 1) {
      // TODO: should probably use filter instead of find incase multiple tabs with same uid and diff games
      const userRoom = this.rooms.find((room) => room.players.map((p) => p.id).includes(userId));
      if (userRoom) {
        const index = userRoom.players.findIndex((p) => p.id === userId);

        // User was host, delete the game
        if (index === 0) {
          const roomsIndex = this.rooms.findIndex((r) => r.gameId === userRoom.gameId && r.roomId === userRoom.roomId);
          this.rooms.splice(roomsIndex, 1);
          const response: ILobbyJoinLeaveResponse = {
            type: "join_leave",
            players: [],
            state: "closed",
          };
          this.room.broadcast(JSON.stringify(response));
        }
        // User was guest, delete the player
        else {
          userRoom.players.splice(index, 1);
          const response: ILobbyJoinLeaveResponse = {
            type: "join_leave",
            players: userRoom.players.map((player) => player.name),
            state: userRoom.state,
          };
          this.room.broadcast(JSON.stringify(response));
        }
      }
    }

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
        await this.createGameLobbyRoom(data.gameId, userId, data.numPlayers, data.isPrivate);
        break;
      case "join":
        await this.joinGameLobbyRoom("join", data.roomId, userId);
        break;
      case "leave":
        await this.joinGameLobbyRoom("leave", data.roomId, userId);
        break;
    }

    console.log("onmessage", data.type, this.rooms);
  }

  async createGameLobbyRoom(gameId: string, userId: string, numPlayers: number, isPrivate: boolean) {
    this.rooms = await this.getRooms();

    const room = createRoom(gameId, userId, numPlayers, isPrivate);
    this.rooms.push(room);
    await this.room.storage.put("rooms", this.rooms);
    const response: ILobbyCreateResponse = {
      type: "create",
      gameId,
      roomId: room.roomId,
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

      // User was host, delete the game
      if (index === 0) {
        const roomsIndex = this.rooms.findIndex((r) => r.gameId === room.gameId && r.roomId === room.roomId);
        this.rooms.splice(roomsIndex, 1);
        const response: ILobbyJoinLeaveResponse = {
          type: "join_leave",
          players: [],
          state: "closed",
        };
        this.room.broadcast(JSON.stringify(response));
        return;
      } else {
        room?.players.splice(index, 1);
      }
    }

    if (room.players.length === room.numPlayers) {
      room.state = "started";
    }
    await this.room.storage.put("rooms", this.rooms);

    const response: ILobbyJoinLeaveResponse = {
      type: "join_leave",
      players: room.players.map((player) => player.name),
      state: room.state,
    };
    this.room.broadcast(JSON.stringify(response));
  }
}

Lobby satisfies Party.Worker;

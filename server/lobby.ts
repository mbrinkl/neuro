import type * as Party from "partykit/server";
import {
  LobbyRequest,
  type ILobbyCreateResponse,
  type ILobbyRoomsResponse,
} from "../shared/lobby/schema";

export default class Lobby implements Party.Server {
  connections: Record<string, number>;
  openRooms: string[];

  constructor(readonly room: Party.Room) {
    this.connections = {};
    this.openRooms = ["abcd"];
  }

  async onStart() {
    // games.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);
    // console.log("IN ON START", games);
  }

  async onRequest(request: Party.Request) {
    // read from storage
    this.connections =
      this.connections ?? (await this.room.storage.get("connections")) ?? {};

    if (request.method === "GET") {
      return new Response(JSON.stringify(this.openRooms));
    }

    // update connection count
    if (request.method === "POST") {
      const update = (await request.json()) as {
        party: string;
        roomId: string;
        type: string;
      };
      const key = `${update.party}-${update.roomId}`;
      const count = this.connections[key] ?? 0;

      if (update.type === "connect") this.connections[key] = count + 1;
      if (update.type === "disconnect")
        this.connections[key] = Math.max(0, count - 1);

      const response: ILobbyRoomsResponse = {
        type: "rooms",
        rooms: this.getRooms(),
      };
      this.room.broadcast(JSON.stringify(response));
      await this.room.storage.put("connections", this.connections);
    }

    return new Response(null);
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const response: ILobbyRoomsResponse = {
      type: "rooms",
      rooms: this.getRooms(),
    };
    conn.send(JSON.stringify(response));
  }

  onMessage(message: string, sender: Party.Connection) {
    const result = LobbyRequest.safeParse(JSON.parse(message));
    if (result.success) {
      const data = result.data;
      switch (data.type) {
        case "create":
          this.createRoom(data.party, sender);
          break;
      }
    }
  }

  createRoom(party: string, sender: Party.Connection) {
    const roomId = (Math.random() + 1).toString(36).substring(7);
    this.openRooms.push(roomId);
    const response: ILobbyCreateResponse = {
      type: "create",
      party,
      roomId,
    };
    sender.send(JSON.stringify(response));
  }

  getRooms() {
    let rooms: string[] = [];
    for (const [key, value] of Object.entries(this.connections)) {
      if (value > 0) {
        rooms.push(key);
      }
    }
    return rooms;
  }
}

Lobby satisfies Party.Worker;

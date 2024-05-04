import type * as Party from "partykit/server";
import type { IAction } from "../shared/types";

export default class Lobby implements Party.Server {
  connections: Record<string, number>;
  openRooms: string[];

  constructor(readonly room: Party.Room) {
    this.connections = {};
    this.openRooms = ["abcd"];
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
      const update = (await request.json()) as { roomId: string; type: string };
      const count = this.connections[update.roomId] ?? 0;

      if (update.type === "connect")
        this.connections[update.roomId] = count + 1;
      if (update.type === "disconnect")
        this.connections[update.roomId] = Math.max(0, count - 1);

      const val = { type: "rooms", payload: this.getRooms() };
      this.room.broadcast(JSON.stringify(val));
      await this.room.storage.put("connections", this.connections);
    }

    return new Response(null);
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const val = { type: "rooms", payload: this.getRooms() };
    conn.send(JSON.stringify(val));
  }

  onMessage(message: string, sender: Party.Connection) {
    if (message === "create") {
      const id = (Math.random() + 1).toString(36).substring(7);
      this.openRooms.push(id);
      const action: IAction<string> = { type: "create", payload: id };
      sender.send(JSON.stringify(action));
    }
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

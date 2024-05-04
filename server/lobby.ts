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
    const action: IAction<unknown> = JSON.parse(message);
    if (action.type === "create") {
      console.log("in it", action);
      const party = (action as IAction<string>).payload;
      const id = (Math.random() + 1).toString(36).substring(7);
      this.openRooms.push(id);
      const response: IAction<{ party: string; roomId: string }> = {
        type: "create",
        payload: { party, roomId: id },
      };
      sender.send(JSON.stringify(response));
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

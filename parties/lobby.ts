import type * as Party from "partykit/server";

export default class Lobby implements Party.Server {
  connections: Record<string, number>;

  constructor(readonly room: Party.Room) {
    this.connections = {};
  }

  async onRequest(request: Party.Request) {
    // read from storage
    this.connections =
      this.connections ?? (await this.room.storage.get("connections")) ?? {};

    // update connection count
    if (request.method === "POST") {
      const update = (await request.json()) as { roomId: string; type: string };
      const count = this.connections[update.roomId] ?? 0;

      if (update.type === "connect")
        this.connections[update.roomId] = count + 1;
      if (update.type === "disconnect")
        this.connections[update.roomId] = Math.max(0, count - 1);

      this.room.broadcast(JSON.stringify(this.getRooms()));
      await this.room.storage.put("connections", this.connections);
    }

    // send connection counts to requester
    return new Response(JSON.stringify(this.connections));
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    conn.send(JSON.stringify(this.getRooms()));
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

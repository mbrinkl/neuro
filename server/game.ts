import type * as Party from "partykit/server";
import { gameDefs, type IGameDef, type IGameMessage, type IGame, executeMove } from "../shared/config";

export default class TicTacToeServer implements Party.Server {
  game: IGame;
  gameDef: IGameDef;
  roomCreationError?: string;
  connections: Record<string, string>;

  constructor(readonly room: Party.Room) {
    const [gameId] = room.id.split("-");
    const def = gameDefs.find((def) => def.id === gameId);

    if (!def) {
      throw new Error("Game Def not found for " + gameId);
    }

    this.gameDef = def;
    this.game = {
      G: JSON.parse(JSON.stringify(def.config.flow.initialState)),
      ctx: {
        currentPlayer: 1,
        numPlayers: 0,
      },
    };
    this.connections = {};
  }

  async onStart() {
    // Check if the game exists in storage and set
    const storedGameState = await this.room.storage.get<IGame>("game");
    if (storedGameState) {
      this.game = storedGameState;
      return;
    }

    // If game does not exist in storage, check if it is a valid game from lobby
    const rooms = await this.getAvailableRooms();
    if (!rooms.includes(this.room.id)) {
      this.roomCreationError = "Room does not exist";
    }
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    if (this.roomCreationError) {
      return conn.close(4000, this.roomCreationError);
    }

    const userId = new URL(ctx.request.url).searchParams.get("userId");

    if (!userId) {
      return conn.close(4000, "No UserID");
    }

    if (userId === "TODO") {
      return conn.close(4000, "Cant Join - Invalid Player");
    }

    this.connections[conn.id] = userId;

    // TODO: assign players by user id?
    // should probably already be set by onStart
    this.game.G.players[conn.id] = {
      id: this.game.ctx.numPlayers + 1,
      isConnected: true,
    };
    this.game.ctx.numPlayers++;

    conn.send(JSON.stringify(this.game));
  }

  onClose(conn: Party.Connection<unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.connections[conn.id];
    const player = this.game.G.players[conn.id];
    if (player) {
      player.isConnected = false;
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    const gameMessage: IGameMessage = JSON.parse(message);
    executeMove(this.game, gameMessage.type, this.gameDef.config.flow, sender.id, gameMessage.args);
    this.room.broadcast(JSON.stringify(this.game));
  }

  async getAvailableRooms(): Promise<string[]> {
    const lobbyParty = this.room.context.parties.main;
    const lobbyRoomId = "lobby";
    const lobbyRoom = lobbyParty.get(lobbyRoomId);

    const data = await lobbyRoom.fetch({
      method: "GET",
    });
    return data.json();
  }
}

TicTacToeServer satisfies Party.Worker;

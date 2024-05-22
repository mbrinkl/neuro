import type * as Party from "partykit/server";
import type { IGameDef, IGameMessage, IGame } from "../shared/types";
import { gameDefs, executeMove } from "../shared/util";
import type { ILobbyRoom } from "./lobby";

export default class TicTacToeServer implements Party.Server {
  roomId: string;
  game: IGame;
  gameDef: IGameDef;
  roomCreationError?: string;
  connections: Record<string, string>;

  constructor(readonly room: Party.Room) {
    const [gameId, roomId] = room.id.split("-");
    const def = gameDefs.find((def) => def.id === gameId);

    if (!def) {
      throw new Error("Game Def not found for " + gameId);
    }

    if (!roomId) {
      throw new Error("Invalid room id");
    }

    this.roomId = roomId;
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
    const room = await this.getCreatedRoom();
    console.log("get created room...", room);
    if (!room) {
      this.roomCreationError = "Room does not exist";
      return;
    }

    room.players.forEach((player, index) => {
      this.game.G.players[player.id] = {
        id: index + 1, // todo: id should come from room data
        isConnected: false,
      };
    });
    this.game.ctx.numPlayers = room.numPlayers;
    await this.room.storage.put("game", this.game);
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    if (this.roomCreationError) {
      return conn.close(4000, this.roomCreationError);
    }

    const userId = new URL(ctx.request.url).searchParams.get("userId");

    if (!userId) {
      return conn.close(4000, "No UserID");
    }

    // user id is not in the list of users for game
    if (userId === "TODO") {
      return conn.close(4000, "Cant Join - Invalid Player");
    }

    this.connections[conn.id] = userId;
    this.game.G.players[userId].isConnected = true;

    conn.send(JSON.stringify(this.game));
  }

  onClose(conn: Party.Connection<unknown>) {
    const userId = this.connections[conn.id];

    // was not a player
    if (!userId) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.connections[conn.id];
    const player = this.game.G.players[userId];

    // if player is not connected with some other connection, update connection status
    if (!Object.values(this.connections).some((v) => v === userId)) {
      player.isConnected = false;
      this.room.broadcast(JSON.stringify(this.game));
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    const gameMessage: IGameMessage = JSON.parse(message);
    executeMove(this.game, gameMessage.type, this.gameDef.config.flow, this.connections[sender.id], gameMessage.args);
    this.room.broadcast(JSON.stringify(this.game));
  }

  async getCreatedRoom(): Promise<ILobbyRoom> {
    const lobbyParty = this.room.context.parties.main;
    const lobbyRoomId = "lobby";
    const lobbyRoom = lobbyParty.get(lobbyRoomId);

    const data = await lobbyRoom.fetch({
      method: "POST",
      body: JSON.stringify({
        gameId: this.gameDef.id,
        roomId: this.roomId,
      }),
    });
    return data.json();
  }
}

TicTacToeServer satisfies Party.Worker;

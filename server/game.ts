import type * as Party from "partykit/server";
import { gameDefs, type IGameDef, type IGameMessage, type IGame, ExecuteMove } from "../shared/config";

export default class TicTacToeServer implements Party.Server {
  game: IGame;
  gameDef: IGameDef;

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
        numPlayers: 2,
      },
    };
  }

  async onStart() {
    const storedGameState = await this.room.storage.get<IGame>("game");
    if (storedGameState) {
      this.game = storedGameState;
    }
  }

  async onConnect(conn: Party.Connection) {
    // TODO: can this be done in onBeforeConnect?
    const rooms = await this.getAvailableRooms();
    // if (!rooms.includes(this.room.id)) {
    //   return conn.close(4004, "Room Not Found");
    // }
    // try {
    //   const issuer = "tmp";
    //   const token = new URL(request.url).searchParams.get("token") ?? "";
    //   const session = await verifyToken(token, { issuer });
    //   return request;
    // } catch (e) {
    //   return new Response("Unauthorized", { status: 401 });
    // }

    const playerNumber = Object.keys(this.game.G.players).length + 1;
    this.game.G.players[conn.id] = {
      id: playerNumber,
      isConnected: true,
    };

    conn.send(JSON.stringify(this.game));
    this.updateLobby("connect", conn);
  }

  onClose(conn: Party.Connection<unknown>) {
    const player = this.game.G.players[conn.id];
    if (player) {
      player.isConnected = false;
      this.updateLobby("disconnect", conn);
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    const gameMessage: IGameMessage = JSON.parse(message);

    ExecuteMove(this.game, gameMessage.type, this.gameDef.config.flow, sender.id, gameMessage.args);

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

  async updateLobby(type: "connect" | "disconnect", connection: Party.Connection) {
    const lobbyParty = this.room.context.parties.main;
    const lobbyRoomId = "lobby";
    const lobbyRoom = lobbyParty.get(lobbyRoomId);

    await lobbyRoom.fetch({
      method: "POST",
      body: JSON.stringify({
        type,
        party: "tictactoe",
        connectionId: connection.id,
        roomId: this.room.id,
      }),
    });
  }
}

TicTacToeServer satisfies Party.Worker;

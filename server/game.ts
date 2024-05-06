import type * as Party from "partykit/server";
import { gameDefs, type IGameDef, type IGameMessage, type IGame, executeMove } from "../shared/config";

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
        numPlayers: 0,
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
    if (!rooms.includes(this.room.id)) {
      return conn.close(4004, "Room " + this.room.id + " Not Found");
    }

    const playerNumber = Object.keys(this.game.G.players).length + 1;
    this.game.G.players[conn.id] = {
      id: playerNumber,
      isConnected: true,
    };

    conn.send(JSON.stringify(this.game));
    this.updateLobby("connect");
  }

  onClose(conn: Party.Connection<unknown>) {
    const player = this.game.G.players[conn.id];
    if (player) {
      player.isConnected = false;
      this.updateLobby("disconnect");
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

  async updateLobby(type: "connect" | "disconnect") {
    const lobbyParty = this.room.context.parties.main;
    const lobbyRoomId = "lobby";
    const lobbyRoom = lobbyParty.get(lobbyRoomId);

    await lobbyRoom.fetch({
      method: "POST",
      body: JSON.stringify({
        type,
        gameId: this.gameDef.id,
        roomId: this.room.id,
      }),
    });
  }
}

TicTacToeServer satisfies Party.Worker;

import type * as Party from "partykit/server";
import { isDraw, isVictory } from "../shared/games/tictactoe/logic";
import { gameDefs, type IGameDef, type IGameMessage, type IGame } from "../shared/config";

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
      G: JSON.parse(JSON.stringify(def.config.gameStructure.initialState)),
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

  static async onBeforeConnect(request: Party.Request, lobby: Party.Lobby) {
    const rooms = await this.getAvailableRooms(lobby);
    console.log("in before connect plox", rooms);
    // if (!rooms.includes(lobby.id)) {
    //   return new Response("Not Found", { status: 404 });
    // }

    return request;
    // try {
    //   const issuer = "tmp";
    //   const token = new URL(request.url).searchParams.get("token") ?? "";
    //   const session = await verifyToken(token, { issuer });
    //   return request;
    // } catch (e) {
    //   return new Response("Unauthorized", { status: 401 });
    // }
  }

  onConnect(conn: Party.Connection) {
    const playerNumber = Object.keys(this.game.G.players).length + 1;
    this.game.G.players[conn.id] = {
      id: playerNumber,
      isConnected: true,
    };

    conn.send(JSON.stringify(this.game));
    this.updateLobby("connect", conn);
  }

  onClose(conn: Party.Connection<unknown>) {
    this.game.G.players[conn.id].isConnected = false;
    this.updateLobby("disconnect", conn);
  }

  onMessage(message: string, sender: Party.Connection) {
    const player = this.game.G.players[sender.id];

    if (this.game.ctx.currentPlayer !== player.id) {
      return;
    }

    const { moves } = this.gameDef.config.gameStructure;
    const gameMessage: IGameMessage = JSON.parse(message);

    const move = moves[gameMessage.type];

    // invalid move
    if (move === undefined) return;

    move(this.game, player.id, ...gameMessage.args);

    // TODO: game specific hooks
    if (isVictory(this.game.G.board, player.id)) {
      this.game.G.winner = player.id;
    } else if (isDraw(this.game.G.board)) {
      this.game.ctx.winner = 0;
    }
    this.game.ctx.currentPlayer = 1 + (this.game.ctx.currentPlayer % 2);

    this.room.broadcast(JSON.stringify(this.game));
  }

  static async getAvailableRooms(lobby: Party.Lobby): Promise<string[]> {
    const lobbyParty = lobby.parties.main;
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

import { verifyToken } from "@clerk/backend";
import type * as Party from "partykit/server";
import type { IGameMessage, IGameState } from "../shared/games/tictactoe/types";
import { doMove, isDraw, isVictory } from "../shared/games/tictactoe/logic";

export default class TicTacToeServer implements Party.Server {
  gameState: IGameState;

  constructor(readonly room: Party.Room) {
    this.gameState = {
      players: {},
      board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ctx: {
        currentPlayer: 1,
        numPlayers: 2,
      },
    };
  }

  async onStart() {
    const storedGameState = await this.room.storage.get<IGameState>(
      "gamestate"
    );
    if (storedGameState) {
      this.gameState = storedGameState;
    }
  }

  static async onBeforeConnect(request: Party.Request, lobby: Party.Lobby) {
    const rooms = await this.getAvailableRooms(lobby);
    console.log("in before connect plox", rooms);
    if (!rooms.includes(lobby.id)) {
      return new Response("Not Found", { status: 404 });
    }

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

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const playerNumber = Object.keys(this.gameState.players).length + 1;
    this.gameState.players[conn.id] = {
      id: playerNumber,
      isConnected: true,
    };

    conn.send(JSON.stringify(this.gameState));
    this.updateLobby("connect", conn);
  }

  onClose(conn: Party.Connection<unknown>) {
    this.gameState.players[conn.id].isConnected = false;
    this.updateLobby("disconnect", conn);
  }

  onMessage(message: string, sender: Party.Connection) {
    const player = this.gameState.players[sender.id];

    if (this.gameState.ctx.currentPlayer !== player.id) {
      return;
    }

    const gameMessage: IGameMessage = JSON.parse(message);
    if (gameMessage.type === "click_cell") {
      const index = gameMessage.args as number;
      this.gameState = doMove(this.gameState, index, player.id);
      if (isVictory(this.gameState.board, player.id)) {
        this.gameState.winner = player.id;
      } else if (isDraw(this.gameState.board)) {
        this.gameState.winner = 0;
      }
      this.gameState.ctx.currentPlayer =
        1 + (this.gameState.ctx.currentPlayer % 2);
      this.room.broadcast(JSON.stringify(this.gameState));
    }
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

  async updateLobby(
    type: "connect" | "disconnect",
    connection: Party.Connection
  ) {
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

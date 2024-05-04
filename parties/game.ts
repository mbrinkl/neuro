import { verifyToken } from "@clerk/backend";
import type * as Party from "partykit/server";

const winConditions: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const isValidMove = (index: number, board: number[]) => {
  return index >= 0 && index < board.length && board[index] === 0;
};

export const isVictory = (board: number[], playerId: number): boolean => {
  const indices = board
    .map((value, i) => (value === playerId ? i : -1))
    .filter((index) => index !== -1);
  return winConditions.some((winCondition) =>
    winCondition.every((index) => indices.includes(index))
  );
};

export const isDraw = (board: number[]) => board.every((cell) => cell !== 0);

export interface IGameMessage {
  type: string;
  args: any;
}

export interface IGameState {
  players: Record<string, IPlayer>;
  board: number[];
  ctx: IGameContext;
  winner?: number;
}

export interface IGameContext {
  currentPlayer: number;
  numPlayers: number;
}

export interface IPlayer {
  id: number;
  isConnected: boolean;
}

export const doMove = (
  gameState: IGameState,
  index: number,
  playerId: number
) => {
  if (!isValidMove(index, gameState.board)) return gameState;
  gameState.board[index] = playerId;
  return gameState;
};

export default class Game implements Party.Server {
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
        connectionId: connection.id,
        roomId: this.room.id,
      }),
    });
  }
}

Game satisfies Party.Worker;

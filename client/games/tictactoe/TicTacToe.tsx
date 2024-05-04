import { useState } from "react";
import usePartySocket from "partysocket/react";
import { Link, useParams } from "react-router-dom";
import { doMove } from "../../../shared/games/tictactoe/logic";
import type { IGameState } from "../../../shared/games/tictactoe/types";
import "./TicTacToe.css";

export const TicTacToe = () => {
  const { roomId } = useParams();
  const [gameState, setGameState] = useState<IGameState | null>(null);

  const socket = usePartySocket({
    room: roomId,
    party: "tictactoe",
    onMessage(evt) {
      setGameState(JSON.parse(evt.data));
    },
    onOpen(evt) {
      console.log("got open", evt);
    },
    onError(evt) {
      console.log("got err", evt);
    },
    onClose(evt) {
      console.log("got close");
    },
  });

  if (!gameState) {
    return <span>Loading...</span>;
  }

  const me = gameState.players[socket.id].id;

  const onCellClick = (index: number) => {
    // optimistic local update
    setGameState((prev) => doMove(JSON.parse(JSON.stringify(prev)), index, -1));
    // send the update to the server
    socket.send(JSON.stringify({ type: "click_cell", args: index }));
  };

  return (
    <div>
      <Link to="/">Lobby</Link>
      <div>winner: {gameState.winner}</div>
      <div>current: {gameState.ctx.currentPlayer}</div>
      <div>
        players (me {me}):{" "}
        {Object.values(gameState.players).map((p) => (
          <span key={p.id}>
            | {p.id} - {p.isConnected.toString()} |
          </span>
        ))}
      </div>
      <div id="board">
        {gameState.board.map((val, index) => (
          <div key={index} className="cell" onClick={() => onCellClick(index)}>
            {val}
          </div>
        ))}
      </div>
    </div>
  );
};

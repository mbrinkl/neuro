import { useState } from "react";
import usePartySocket from "partysocket/react";
import { doMove, type IGameState } from "../../parties/game";
import { Link, useParams } from "react-router-dom";

export default function Counter() {
  const { roomId } = useParams();
  const [gameState, setGameState] = useState<IGameState | null>(null);

  const socket = usePartySocket({
    room: roomId,
    party: "game",
    onMessage(evt) {
      setGameState(JSON.parse(evt.data));
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
          <span>
            | {p.id} - {p.isConnected.toString()} |
          </span>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gap: "1px",
          gridTemplateColumns: "repeat(3, 1fr)",
          width: "300px",
        }}
      >
        {gameState.board.map((cell, index) => (
          <div
            onClick={() => onCellClick(index)}
            style={{ backgroundColor: "red" }}
          >
            {cell}
          </div>
        ))}
      </div>
    </div>
  );
}

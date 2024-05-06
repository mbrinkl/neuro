import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import usePartySocket from "partysocket/react";
import type { IGameDef, IGameState } from "../../shared/config";

interface IGameProps {
  gameDef: IGameDef;
}

export const Game = (props: IGameProps) => {
  const { roomId } = useParams();
  const { Board, game } = props.gameDef.config;

  const [gameState, setGameState] = useState<IGameState | null>(null);

  const socket = usePartySocket({
    room: props.gameDef.id + "-" + roomId,
    party: "game",
    query: () => ({
      gameId: props.gameDef.id,
    }),
    onMessage(evt) {
      setGameState(JSON.parse(evt.data));
    },
  });

  if (!gameState) {
    return <div>Loading...</div>;
  }

  // TODO: not every render
  const moves: typeof game.moves = {};
  for (const [key, value] of Object.entries(game.moves)) {
    const move = (...args: unknown[]) => {
      const updatedGameState = JSON.parse(JSON.stringify(gameState));
      value(updatedGameState, updatedGameState.players[socket.id].id, ...args);

      // optimisitic local update
      setGameState(updatedGameState);
      // server update request
      socket.send(JSON.stringify({ type: key, args }));
    };
    moves[key] = move;
  }

  return (
    <div>
      <Link to="/">Lobby</Link>
      <Board gameState={gameState} playerId={gameState.players[socket.id].id} moves={moves} />
    </div>
  );
};

import { useMemo, useState } from "react";
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

  const moves = useMemo(() => {
    const modifiedMoves: typeof game.moves = {};
    for (const [key, fn] of Object.entries(game.moves)) {
      const move = (...args: unknown[]) => {
        // optimisitic local update
        setGameState((prev) => {
          const updatedGameState = JSON.parse(JSON.stringify(prev));
          fn(updatedGameState, updatedGameState.players[socket.id].id, ...args);
          return updatedGameState;
        });
        // server update request
        socket.send(JSON.stringify({ type: key, args }));
      };
      modifiedMoves[key] = move;
    }
    return modifiedMoves;
  }, [game, socket.id]);

  if (!gameState) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Link to="/">Lobby</Link>
      <Board gameState={gameState} playerId={gameState.players[socket.id].id} moves={moves} />
    </div>
  );
};

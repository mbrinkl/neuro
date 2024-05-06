import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import usePartySocket from "partysocket/react";
import { type IGameDef, type IGame, executeMove } from "../../shared/config";

interface IGameProps {
  gameDef: IGameDef;
}

export const Game = (props: IGameProps) => {
  const { roomId } = useParams();
  const { Board, flow } = props.gameDef.config;

  const [game, setGame] = useState<IGame | null>(null);
  const [error, setError] = useState<string>();

  // TODO: should stop from trying to reconnect after getting error?
  const socket = usePartySocket({
    room: props.gameDef.id + "-" + roomId,
    party: "game",
    onMessage(evt) {
      setError(undefined);
      setGame(JSON.parse(evt.data));
    },
    onClose(evt) {
      setError(evt.reason);
    },
  });

  const moves = useMemo(() => {
    const modifiedMoves: typeof flow.moves = {};
    for (const key of Object.keys(flow.moves)) {
      const move = (...args: unknown[]) => {
        // optimisitic local update
        setGame((prev) => {
          const updatedGame = JSON.parse(JSON.stringify(prev));
          try {
            executeMove(updatedGame, key, flow, socket.id, args);
            return updatedGame;
          } catch (err) {
            console.error((err as Error).message);
            return prev;
          }
        });
        // server update request
        socket.send(JSON.stringify({ type: key, args }));
      };
      modifiedMoves[key] = move;
    }
    return modifiedMoves;
  }, [flow, socket.id]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!game) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Link to="/">Lobby</Link>
      <Board G={game.G} ctx={game.ctx} playerId={game.G.players[socket.id].id} moves={moves} />
    </div>
  );
};

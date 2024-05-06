import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import usePartySocket from "partysocket/react";
import type { IGameDef, IGame } from "../../shared/config";

interface IGameProps {
  gameDef: IGameDef;
}

export const Game = (props: IGameProps) => {
  const { roomId } = useParams();
  const { Board, gameStructure } = props.gameDef.config;

  const [game, setGame] = useState<IGame | null>(null);

  const socket = usePartySocket({
    room: props.gameDef.id + "-" + roomId,
    party: "game",
    onMessage(evt) {
      setGame(JSON.parse(evt.data));
    },
  });

  const moves = useMemo(() => {
    const modifiedMoves: typeof gameStructure.moves = {};
    for (const [key, fn] of Object.entries(gameStructure.moves)) {
      const move = (...args: unknown[]) => {
        // optimisitic local update
        setGame((prev) => {
          const updatedGame = JSON.parse(JSON.stringify(prev));
          fn(updatedGame, updatedGame.G.players[socket.id].id, ...args);
          return updatedGame;
        });
        // server update request
        socket.send(JSON.stringify({ type: key, args }));
      };
      modifiedMoves[key] = move;
    }
    return modifiedMoves;
  }, [gameStructure, socket.id]);

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

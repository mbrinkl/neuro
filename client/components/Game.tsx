import {
  Suspense,
  lazy,
  useEffect,
  useState,
  type LazyExoticComponent,
} from "react";
import { useParams } from "react-router-dom";
import type { IGameState } from "../../shared/games/tictactoe/types";
import usePartySocket from "partysocket/react";

export const Game = () => {
  const { gameId, roomId } = useParams();

  const [gameState, setGameState] = useState<IGameState | null>(null);
  const [Board, setBoard] = useState<LazyExoticComponent<
    React.ComponentType<any>
  > | null>(null);

  useEffect(() => {
    // ew
    if (gameId) {
      const lazyBoard = lazy(
        () => import(`../../shared/games/${gameId}/Board.tsx`)
      );
      setBoard(lazyBoard);
    }
  }, [gameId]);

  const socket = usePartySocket({
    room: roomId,
    party: "game",
    query: () => ({
      gameId,
    }),
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

  if (!gameState || !Board) {
    return <div>Loading...</div>;
  }

  return (
    <Suspense fallback={<div>LOADING 2</div>}>
      <Board
        gameState={gameState}
        socket={socket}
        setGameState={setGameState}
      />
    </Suspense>
  );
};

import { useState } from "react";
import usePartySocket from "partysocket/react";
import { Link, useParams } from "react-router-dom";
import type { IGameState } from "../../../shared/games/tictactoe/types";
import "./ConnectFour.css";

export const ConnectFour = () => {
  const { roomId } = useParams();
  const [gameState, setGameState] = useState<IGameState | null>(null);

  const socket = usePartySocket({
    room: roomId,
    party: "connectfour",
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

  return <div>TicTacToe</div>;
};

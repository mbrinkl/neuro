import usePartySocket from "partysocket/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { IAction } from "../../shared/types";

export const Lobby = () => {
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const navigate = useNavigate();

  const socket = usePartySocket({
    room: "lobby",
    onMessage(evt) {
      const data = JSON.parse(evt.data) as IAction<unknown>;
      if (data.type === "rooms") {
        setRoomIds((data as IAction<string[]>).payload);
      } else if (data.type === "create") {
        const { party, roomId } = (
          data as IAction<{ party: string; roomId: string }>
        ).payload;
        navigate(`/${party}/${roomId}`);
      }
    },
  });

  const onCreateClick = (party: string) => {
    socket.send(JSON.stringify({ type: "create", payload: party }));
  };

  return (
    <div>
      <span>Join:</span>
      {roomIds.map((roomId) => (
        <Link to={`/tictactoe/${roomId}`}>{roomId}</Link>
      ))}
      <button onClick={() => onCreateClick("tictactoe")}>Create</button>
    </div>
  );
};

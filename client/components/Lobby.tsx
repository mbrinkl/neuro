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
        navigate(`/game/${(data as IAction<string>).payload}`);
      }
    },
  });

  const onCreateClick = () => {
    socket.send("create");
  };

  return (
    <div>
      <span>Join:</span>
      {roomIds.map((roomId) => (
        <Link to={`/game/${roomId}`}>{roomId}</Link>
      ))}
      <button onClick={onCreateClick}>Create</button>
    </div>
  );
};

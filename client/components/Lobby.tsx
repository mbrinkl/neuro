import usePartySocket from "partysocket/react";
import { useState } from "react";
import { Link } from "react-router-dom";

export const Lobby = () => {
  const [roomIds, setRoomIds] = useState<string[]>([]);

  usePartySocket({
    room: "lobby",
    onMessage(evt) {
      setRoomIds(JSON.parse(evt.data));
    },
  });

  const getId = () => {
    // const storedId = localStorage.getItem("guest-id");
    // if (storedId) return storedId;
    const id = (Math.random() + 1).toString(36).substring(7);
    // localStorage.setItem("guest-id", id);
    return id;
  };

  return (
    <div>
      <span>Join:</span>
      {roomIds.map((roomId) => (
        <Link to={`game/${roomId}`}>{roomId}</Link>
      ))}
      <Link to={`game/${getId()}`}>Create</Link>
    </div>
  );
};

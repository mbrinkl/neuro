import usePartySocket from "partysocket/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@mantine/core";
import {
  LobbyResponse,
  type ILobbyCreateRequest,
} from "../../shared/lobby/schema";

export const Lobby = () => {
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const navigate = useNavigate();

  const GAMES: string[] = ["tictactoe", "connectfour"];

  const socket = usePartySocket({
    room: "lobby",
    onMessage(evt) {
      const result = LobbyResponse.safeParse(JSON.parse(evt.data));
      if (result.success) {
        const data = result.data;
        switch (data.type) {
          case "rooms":
            setRoomIds(data.rooms);
            break;
          case "create":
            navigate(`/${data.party}/${data.roomId}`);
            break;
        }
      }
    },
  });

  const onCreateClick = (party: string) => {
    const request: ILobbyCreateRequest = {
      type: "create",
      party,
    };
    socket.send(JSON.stringify(request));
  };

  return (
    <div>
      <span>Join:</span>
      {roomIds.map((roomId) => (
        <Link to={`/tictactoe/${roomId}`}>{roomId}</Link>
      ))}
      {GAMES.map((name) => (
        <Button variant="filled" onClick={() => onCreateClick(name)}>
          Create {name}
        </Button>
      ))}
    </div>
  );
};

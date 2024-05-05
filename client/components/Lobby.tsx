import usePartySocket from "partysocket/react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Anchor, Button, rem } from "@mantine/core";
import {
  LobbyResponse,
  type ILobbyCreateRequest,
} from "../../shared/lobby/schema";
import { IconSourceCode } from "@tabler/icons-react";
import { gameDefs } from "../../shared/config";

export const Lobby = () => {
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const navigate = useNavigate();

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

  const onCreateClick = (gameId: string) => {
    const request: ILobbyCreateRequest = {
      type: "create",
      party: gameId,
    };
    socket.send(JSON.stringify(request));
  };

  return (
    <div>
      <span>Join:</span>
      {roomIds.map((room) => {
        const [party, roomId] = room.split("-");
        return (
          <Link key={room} to={`/${party}/${roomId}`}>
            {room}
          </Link>
        );
      })}
      {gameDefs.map(({ id, name }) => (
        <Button key={id} variant="filled" onClick={() => onCreateClick(id)}>
          Create {name}
        </Button>
      ))}
      <Anchor
        href="https://github.com/mbrinkl/neuro"
        target="_blank"
        style={{ display: "flex", alignItems: "center" }}
      >
        <IconSourceCode
          style={{ width: rem(25), height: rem(25) }}
          stroke={1.5}
          color="var(--mantine-color-blue-filled)"
        />
        Source
      </Anchor>
    </div>
  );
};

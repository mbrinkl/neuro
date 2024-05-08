import { gameDefs } from "../../shared/config";
import usePartySocket from "partysocket/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Anchor, Button, Flex, rem } from "@mantine/core";
import { LobbyResponse } from "../../shared/lobby/schema";
import { IconSourceCode } from "@tabler/icons-react";

export const Lobby = () => {
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const navigate = useNavigate();

  usePartySocket({
    room: "lobby",
    onMessage(evt) {
      const result = LobbyResponse.safeParse(JSON.parse(evt.data));
      if (result.success) {
        const data = result.data;
        switch (data.type) {
          case "connect":
            setRoomIds(data.rooms);
            break;
          case "create":
            setRoomIds((prev) => [...prev, `${data.gameId}-${data.roomId}`]);
        }
      }
    },
  });

  const onCreateClick = (gameId: string) => {
    navigate(`/${gameId}`);
  };

  return (
    <div>
      <span>Join:</span>
      {roomIds.map((room) => {
        const [gameId, roomId] = room.split("-");
        return (
          <Link key={room} to={`/${gameId}/${roomId}`}>
            {room}
          </Link>
        );
      })}
      <Flex gap="md" py="md">
        {gameDefs.map(({ id, name }) => (
          <Button key={id} variant="filled" onClick={() => onCreateClick(id)}>
            Create {name}
          </Button>
        ))}
      </Flex>
      <Anchor href="https://github.com/mbrinkl/neuro" target="_blank" style={{ display: "flex", alignItems: "center" }}>
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

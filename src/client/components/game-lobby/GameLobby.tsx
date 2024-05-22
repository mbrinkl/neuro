import { Button, Checkbox, Modal } from "@mantine/core";
import { useEffect, useState } from "react";
import type { IGameDef } from "../../../shared/types";
import usePartySocket from "partysocket/react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  LobbyResponse,
  type ILobbyCreateRequest,
  type ILobbyJoinRequest,
  type ILobbyLeaveRequest,
} from "../../../shared/lobby/schema";
import { CopyGameLink } from "./CopyGameLink";
import { NumberPlayersSlider } from "./NumPlayersSlider";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";

interface IPreGameProps {
  gameDef: IGameDef;
}

interface IPlayerInfo {
  name: string;
  token: string;
}

export const GameLobby = ({ gameDef }: IPreGameProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [playerInfo, setPlayerInfo] = useLocalStorage<IPlayerInfo | null>({ key: "player-info" });
  const [searchParams, setSearchParams] = useSearchParams();
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [targetNumPlayers, setTargetNumPlayers] = useState(gameDef.minPlayers);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const navigate = useNavigate();

  const roomId = searchParams.get("id");

  const socket = usePartySocket({
    room: "lobby",
    query: () => ({
      userId,
    }),
    onMessage: (evt) => {
      const result = LobbyResponse.safeParse(JSON.parse(evt.data));
      if (!result.success) {
        console.error("Unable to parse game lobby message: ", result.error.message);
        return;
      }
      const { data } = result;
      switch (data.type) {
        case "connect":
          setUserId(data.userId);
          localStorage.setItem("userId", data.userId);
          break;
        case "create":
          setIsCreating(false);
          setSearchParams({ id: data.roomId });
          setPlayers(data.players);
          break;
        case "join_leave":
          setPlayers(data.players);
          if (data.state === "started") {
            onRoomStarted();
          } else if (data.state === "closed") {
            setSearchParams(undefined);
            setPlayers([]);
            // if closed and was host, back to creation
            // else if not host, show error HOST CANCELLED and link back to main lobby
          }
          break;
      }
    },
  });

  const xor = (name: string) => {
    setPlayerInfo({
      name,
      token: "test_token",
    });
  };

  // If roomId exists and there are no players, this is a guest joining
  useEffect(() => {
    if (roomId && players.length === 0 && playerInfo) {
      const request: ILobbyJoinRequest = {
        type: "join",
        roomId,
        playerName: playerInfo.name,
        playerToken: playerInfo.token,
      };
      socket.send(JSON.stringify(request));
    }
  }, [roomId, players, playerInfo]);

  const onRoomStarted = () => {
    setTimeout(() => {
      navigate(`/${gameDef.id}/${roomId}`);
    }, 2000);
  };

  const onCancelClick = () => {
    if (roomId) {
      setSearchParams(undefined);
      const request: ILobbyLeaveRequest = {
        type: "leave",
        roomId,
      };
      socket.send(JSON.stringify(request));
    }
  };

  const onCreateClick = () => {
    setIsCreating(true);
    const request: ILobbyCreateRequest = {
      type: "create",
      gameId: gameDef.id,
      numPlayers: targetNumPlayers,
      isPrivate,
    };
    socket.send(JSON.stringify(request));
  };

  const disableControls: boolean = isCreating || !!roomId;

  // only show button if host?
  return (
    <div>
      <Modal opened={true} onClose={close} title="playerinfo" centered>
        <input placeholder="name"></input>
        <div>pls set player info</div>
      </Modal>

      <Link to="/">Lobby</Link>
      <div>Game: {gameDef.name}</div>
      <Button onClick={disableControls ? onCancelClick : onCreateClick} loading={isCreating} disabled={isCreating}>
        {disableControls ? "Cancel" : "Create"}
      </Button>
      {roomId && <CopyGameLink />}
      <div>
        {players.map((p) => (
          <div>{p}</div>
        ))}
      </div>
      <NumberPlayersSlider
        value={targetNumPlayers}
        min={gameDef.minPlayers}
        max={gameDef.maxPlayers}
        disabled={disableControls}
        onChange={setTargetNumPlayers}
      />
      <Checkbox
        py="xl"
        label="Private (players can only join by invitation link)"
        checked={isPrivate}
        onChange={(event) => setIsPrivate(event.currentTarget.checked)}
        disabled={disableControls}
      />
      {gameDef.setup && <div>Game Setup...</div>}
    </div>
  );
};

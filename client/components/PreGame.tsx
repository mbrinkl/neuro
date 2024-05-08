import { Button, Checkbox, Slider } from "@mantine/core";
import { useEffect, useState } from "react";
import type { IGameDef } from "../../shared/config";
import usePartySocket from "partysocket/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LobbyResponse, type ILobbyCreateRequest, type ILobbyJoinRequest } from "../../shared/lobby/schema";

interface IPreGameProps {
  gameDef: IGameDef;
}

export const PreGame = ({ gameDef }: IPreGameProps) => {
  // TODO: allow host kicking?

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
          setPlayers(["hosty"]);
          break;
        case "join_leave":
          setPlayers(data.players);
          onRoomStarted();
          break;
        // if (evt.data === "cancelled") {
        //   // kick everyone out, notify that host cancelled
        //   // HOST: back to create screen,
        //   //  reset lobbyId
        //   // OTHER: show error HOST CANCELLED
        //   //  maybe show link back to main lobby idk
        // }
      }
    },
  });

  // If lobbyId exists and there are no players, this is a guest joining
  useEffect(() => {
    if (roomId && players.length === 0 && socket.readyState === socket.OPEN) {
      const request: ILobbyJoinRequest = {
        type: "join",
        roomId,
      };
      socket.send(JSON.stringify(request));
    }
  }, [roomId, players]);

  const onRoomStarted = () => {
    setTimeout(() => {
      navigate(`/${gameDef.id}/${roomId}`);
    }, 2000);
  };

  const onCancelClick = () => {
    socket.send("Leave");
  };

  const onCreateClick = () => {
    setIsCreating(true);
    const request: ILobbyCreateRequest = { type: "create", gameId: gameDef.id, numPlayers: targetNumPlayers };
    socket.send(JSON.stringify(request));
  };

  const shouldShowSlider: boolean = gameDef.minPlayers !== gameDef.maxPlayers;
  const disableControls: boolean = isCreating || !!roomId;

  // only show button if host?
  return (
    <div>
      <Button onClick={disableControls ? onCancelClick : onCreateClick} loading={isCreating} disabled={isCreating}>
        {disableControls ? "Cancel" : "Create"}
      </Button>
      {roomId && <div>Copy Link Here</div>}
      <div>{targetNumPlayers}</div>
      <div>
        {players.map((p) => (
          <div>{p}</div>
        ))}
      </div>
      {shouldShowSlider && (
        <Slider
          color="blue"
          value={targetNumPlayers}
          onChange={setTargetNumPlayers}
          min={gameDef.minPlayers}
          max={gameDef.maxPlayers}
          marks={[
            {
              value: gameDef.minPlayers,
              label: gameDef.minPlayers,
            },
            {
              value: gameDef.maxPlayers,
              label: gameDef.maxPlayers,
            },
          ]}
          disabled={disableControls}
        />
      )}
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
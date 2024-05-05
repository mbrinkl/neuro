import { Center, SimpleGrid } from "@mantine/core";
import type { IGameState } from "./types";
import { Link } from "react-router-dom";
import { doMove } from "./logic";

const Board = ({
  gameState,
  setGameState,
  socket,
}: {
  gameState: IGameState;
  setGameState: any;
  socket: any;
}) => {
  const me = gameState.players[socket.id].id;

  const onCellClick = (index: number) => {
    // optimistic local update
    setGameState((prev) => doMove(JSON.parse(JSON.stringify(prev)), index, me));
    // send the update to the server
    socket.send(JSON.stringify({ type: "click_cell", args: index }));
  };

  const valMap: Record<number, string> = {
    0: "",
    1: "X",
    2: "O",
  };

  return (
    <div>
      <Link to="/">Lobby</Link>
      <div>winner: {gameState.winner}</div>
      <div>current: {gameState.ctx.currentPlayer}</div>
      <div>
        players (me {me}):{" "}
        {Object.values(gameState.players).map((p) => (
          <span key={p.id}>
            | {p.id} - {p.isConnected.toString()} |
          </span>
        ))}
      </div>
      <SimpleGrid
        id="board"
        cols={3}
        w="300px"
        spacing="xs"
        verticalSpacing="xs"
      >
        {gameState.board.map((val, index) => (
          <Center
            key={index}
            onClick={() => onCellClick(index)}
            bg="gray"
            h="100px"
            style={{ cursor: "pointer" }}
          >
            {valMap[val]}
          </Center>
        ))}
      </SimpleGrid>
    </div>
  );
};

export default Board;

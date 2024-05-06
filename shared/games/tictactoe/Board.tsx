import { Center, SimpleGrid } from "@mantine/core";
import type { IGameState } from "./types";
import { Link } from "react-router-dom";
import { doMove } from "./logic";

const Board = ({
  gameState,
  playerId,
  moves,
}: {
  gameState: IGameState;
  playerId: number;
  moves: any;
}) => {
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
        players (me {playerId}):{" "}
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
            onClick={() => moves.clickCell(index)}
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

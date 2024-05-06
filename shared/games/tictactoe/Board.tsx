import { Center, SimpleGrid } from "@mantine/core";
import type { IBoardContext } from "../../config";
import { valMap } from "./constants";

const Board = ({ gameState, playerId, moves }: IBoardContext) => {
  return (
    <div>
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

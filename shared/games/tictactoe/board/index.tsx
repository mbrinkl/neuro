import { Center, Flex, SimpleGrid } from "@mantine/core";
import type { IBoardContext } from "../../../config";
import { valMap } from "../constants";
import type { IGameState, IMoves } from "../types";

const Board = ({ G, ctx, playerId, moves }: IBoardContext<IGameState, IMoves>) => {
  return (
    <Flex direction="column" align="center" justify="center">
      <SimpleGrid id="board" cols={3} w="300px" spacing="xs" verticalSpacing="xs">
        {G.board.map((val, index) => (
          <Center key={index} onClick={() => moves.clickCell(index)} bg="gray" h="100px" style={{ cursor: "pointer" }}>
            {valMap[val]}
          </Center>
        ))}
      </SimpleGrid>
      <div>winner: {ctx.winner}</div>
      <div>current: {ctx.currentPlayer}</div>
      <div>
        players (me {playerId}):{" "}
        {Object.values(G.players).map((p) => (
          <span key={p.id}>
            | {p.id} - {p.isConnected.toString()} |
          </span>
        ))}
      </div>
    </Flex>
  );
};

export default Board;

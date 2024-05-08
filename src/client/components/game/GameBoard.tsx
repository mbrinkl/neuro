import { Loader } from "@mantine/core";
import type { IBaseMoves, IBoardContext, IGame } from "../../../shared/types";

interface IGameBoardProps {
  Board: React.ComponentType<IBoardContext>;
  game: IGame | null;
  moves: IBaseMoves;
  userId: string;
  error?: string;
}

export const GameBoard = ({ Board, game, moves, userId, error }: IGameBoardProps) => {
  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!game) {
    return <Loader color="blue" />;
  }

  return <Board G={game.G} ctx={game.ctx} playerId={game.G.players[userId].id} moves={moves} />;
};

import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { TicTacToe } from "./games/tictactoe/TicTacToe";
import { Lobby } from "./components/Lobby";
import { NotFound } from "./components/NotFound";
import "./styles.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Lobby />,
  },
  {
    path: "/tictactoe/:roomId",
    element: <TicTacToe />,
  },
  {
    path: "/*",
    element: <NotFound />,
  },
]);

createRoot(document.getElementById("app")!).render(
  <RouterProvider router={router} />
);

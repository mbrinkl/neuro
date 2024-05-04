import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Game } from "./components/Game";
import { Lobby } from "./components/Lobby";
import { NotFound } from "./components/NotFound";
import "./styles.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Lobby />,
  },
  {
    path: "/game/:roomId",
    element: <Game />,
  },
  {
    path: "/*",
    element: <NotFound />,
  },
]);

createRoot(document.getElementById("app")!).render(
  <RouterProvider router={router} />
);

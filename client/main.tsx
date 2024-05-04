import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { createTheme, MantineProvider } from "@mantine/core";
import { TicTacToe } from "./games/tictactoe/TicTacToe";
import { Lobby } from "./components/Lobby";
import { NotFound } from "./components/NotFound";
import { ConnectFour } from "./games/connectfour/ConnectFour";
import "@mantine/core/styles.css";

const theme = createTheme({
  /** Put your mantine theme override here */
});

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
    path: "/connectfour/:roomId",
    element: <ConnectFour />,
  },
  {
    path: "/*",
    element: <NotFound />,
  },
]);

createRoot(document.getElementById("app")!).render(
  <MantineProvider theme={theme}>
    <RouterProvider router={router} />
  </MantineProvider>
);

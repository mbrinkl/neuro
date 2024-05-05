import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { createTheme, MantineProvider } from "@mantine/core";
import { Lobby } from "./components/Lobby";
import { NotFound } from "./components/NotFound";
import { Game } from "./components/Game";
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
    path: "/:gameId/:roomId",
    element: <Game />,
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

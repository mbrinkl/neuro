import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { createTheme, MantineProvider } from "@mantine/core";
import { Lobby } from "./components/Lobby";
import { NotFound } from "./components/NotFound";
import { Game } from "./components/Game";
import { gameDefs } from "../shared/config";
import "@mantine/core/styles.css";

const theme = createTheme({
  /** Put your mantine theme override here */
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Lobby />,
  },
  ...gameDefs.map((gameDef) => ({
    path: `/${gameDef.id}/:roomId`,
    element: <Game gameDef={gameDef} />,
  })),
  {
    path: "/*",
    element: <NotFound />,
  },
]);

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("app")!).render(
  <MantineProvider theme={theme} defaultColorScheme="dark">
    <RouterProvider router={router} />
  </MantineProvider>,
);

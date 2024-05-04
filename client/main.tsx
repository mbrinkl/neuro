import { createRoot } from "react-dom/client";
import Counter from "./components/Counter";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Lobby } from "./components/Lobby";
import "./styles.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Lobby />,
  },
  {
    path: "/game/:roomId",
    element: <Counter />,
  },
]);

createRoot(document.getElementById("app")!).render(
  <RouterProvider router={router} />
);

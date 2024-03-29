import { createBrowserRouter } from "react-router-dom";
import App from "./pages/root.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
]);

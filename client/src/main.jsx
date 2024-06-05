import "bootstrap/dist/css/bootstrap.min.css";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage";
import StockInfo from "./pages/StockInfo";
import Login from "./pages/Login";
import Home from "./pages/Home";
import StockLinReg from "./pages/StockLinReg";
import FamaFrench from "./pages/FamaFrench";
import Glossary from "./components/Glossary";
import Blog from "./pages/Blog";
import InvestmentTutorials from "./pages/InvestmentTutorials";
import App from "./App";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Login />,
      },
      {
        path: "/stockinfo/:symbol",
        element: <StockInfo />,
      },
      {
        path: "/stocklinreg/:symbol",
        element: <StockLinReg />,
      },
      {
        path: "/stocklinreg",
        element: <StockLinReg />,
      },
      {
        path: "/famafrench",
        element: <FamaFrench />,
      },
      {
        path: "/glossary",
        element: <Glossary />,
      },
      {
        path: "/glossary/:term",
        element: <Glossary />,
      },
      {
        path: "/blog",
        element: <Blog />,
      },
      {
        path: "/investment-tutorials",
        element: <InvestmentTutorials />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);

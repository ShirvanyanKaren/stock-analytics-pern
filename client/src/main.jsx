// main.jsx
import "bootstrap/dist/css/bootstrap.min.css";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage";
import StockInfo from "./pages/StockInfo";
import Login from "./pages/Login";
import Home from "./pages/Home";
import StockLinReg from "./pages/StockLinReg";
import FamaFrench from "./pages/FamaFrench";
import Glossary from "./pages/Glossary";
import Dashboard from "./pages/Dashboard";
import App from "./App";
import Blog from "./pages/Blog";

import InvestmentTutorials from "./pages/InvestmentTutorials";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Login /> },
      { path: "/stockinfo/:symbol", element: <StockInfo /> },
      { path: "/stocklinreg/:symbol", element: <StockLinReg /> },
      { path: "/linear-regression/:symbol", element: <StockLinReg /> }, // Ensure this path matches the path in Header.jsx
      { path: "/linear-regression/", element: <StockLinReg /> }, // Ensure this path matches the path in Header.jsx
      { path: "/famafrench", element: <FamaFrench /> },
      { path: "/glossary", element: <Glossary /> },
      { path: "/glossary/:term", element: <Glossary /> },
      { path: "/investment-tutorials", element: <InvestmentTutorials /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/portfolio", element: <Home /> }, // Assuming Portfolio points to Home for now
      { path: "/blogs-and-articles", element: <Blog /> },

    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);

import React from 'react';
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App";
import ErrorPage from "./pages/ErrorPage";
import Home from "./pages/Home";
import Login from "./pages/Login";
import StockInfo from "./pages/StockInfo";
import StockLinReg from "./pages/StockLinReg";
import FamaFrench from "./pages/FamaFrench";
import Glossary from "./pages/Glossary";
import InvestmentTutorials from "./pages/InvestmentTutorials";
import Dashboard from "./pages/Dashboard";
import Blog from "./pages/Blog";
import ArticlePage from "./pages/ArticlePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Login /> },
      { path: "/stocks/:symbol", element: <StockInfo /> },
      { path: "/stockinfo/:symbol", element: <StockInfo /> },
      { path: "/stocklinreg/:symbol", element: <StockLinReg /> },
      { path: "/linear-regression/:symbol", element: <StockLinReg /> },
      { path: "/linear-regression/", element: <StockLinReg /> },
      { path: "/famafrench", element: <FamaFrench /> },
      { path: "/glossary", element: <Glossary /> },
      { path: "/glossary/:term", element: <Glossary /> },
      { path: "/investment-tutorials", element: <InvestmentTutorials /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/portfolio", element: <Home /> },
      { path: "/blogs-and-articles", element: <Blog /> },
      { path: "/article/:id", element: <ArticlePage /> }, // Add this line
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
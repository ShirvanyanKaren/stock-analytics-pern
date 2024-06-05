// src/App.jsx
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { Outlet } from "react-router-dom";
import { Provider } from "react-redux";
import { StoreProvider } from "./utils/GlobalState";
import Header from "./components/Header";
import HelpButton from "./components/HelpButton";
import InfoPopup from "./components/InfoPopup";
import { HighlightProvider } from "./contexts/HighlightContext"; // Ensure correct import
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap";
import "animate.css";
import "./App.scss";
import store from "./utils/store";
import AppPar from "./tsParticles/Particles";
import { useState } from "react";

const httpLink = createHttpLink({
  uri: "/graphql",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("jwtToken");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  const [helpMode, setHelpMode] = useState(false);
  const [popupInfo, setPopupInfo] = useState("");

  const toggleHelpMode = () => {
    setHelpMode(!helpMode);
  };

  const handleElementClick = (info) => {
    if (helpMode) {
      setPopupInfo(info);
    }
  };

  return (
    <ApolloProvider client={client}>
      <StoreProvider>
        <Provider store={store}>
          <HighlightProvider>
            <AppPar className="particles" />
            <Header />
            <div className="App">
              <Outlet context={{ helpMode, handleElementClick }} />
              <HelpButton toggleHelpMode={toggleHelpMode} />
              <InfoPopup open={Boolean(popupInfo)} handleClose={() => setPopupInfo("")} info={popupInfo} />
            </div>
          </HighlightProvider>
        </Provider>
      </StoreProvider>
    </ApolloProvider>
  );
}

export default App;

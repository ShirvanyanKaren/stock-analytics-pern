import { Outlet, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { StoreProvider } from "./utils/GlobalState";
import Header from "./components/Header";
import HelpButton from "./components/HelpButton";
import InfoPopup from "./components/InfoPopup";
import { HighlightProvider } from "./contexts/HighlightContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap";
import "animate.css";
import "./App.scss";
import store from "./utils/store";
import AppPar from "./tsParticles/Particles";
import { useState, useEffect } from "react";





function App() {
  const [helpMode, setHelpMode] = useState(false);
  const [popupInfo, setPopupInfo] = useState("");
  const location = useLocation();

  const toggleHelpMode = () => {
    setHelpMode(!helpMode);
  };

  const handleElementClick = (info) => {
    if (helpMode) {
      setPopupInfo(info);
    }
  };


  return (
      <StoreProvider>
        <Provider store={store}>
          <HighlightProvider>
            <AppPar className="particles" />
            <Header />
            <div className="App">
              <Outlet context={{ helpMode, handleElementClick }} />
              <HelpButton toggleHelpMode={toggleHelpMode} />
            </div>
          </HighlightProvider>
        </Provider>
      </StoreProvider>
  );
}

export default App;

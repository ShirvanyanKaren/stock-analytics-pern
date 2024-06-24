import { Outlet } from "react-router-dom";
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
import { useState } from "react";

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
    <StoreProvider>
      <Provider store={store}>
        <HighlightProvider>
          <div className="App">
            <Header />
            <Outlet context={{ helpMode, handleElementClick }} />
            <HelpButton toggleHelpMode={toggleHelpMode} />
            <InfoPopup info={popupInfo} />
          </div>
        </HighlightProvider>
      </Provider>
    </StoreProvider>
  );
}

export default App;

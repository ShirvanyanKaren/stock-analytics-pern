import { Outlet, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { StoreProvider } from "./utils/GlobalState";
import Header from "./components/Header";
import HelpButton from "./components/HelpButton";
import InfoPopup from "./components/InfoPopup";
import { HighlightProvider } from "./contexts/HighlightContext";
import SearchBar from "./components/SearchBar"; // Import the SearchBar component
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
            <div className="App">
              <header className="navbar">
                <div className="navbar-brand">CincoData</div>
                <nav className="navbar-menu">
                  <a href="#">Stock Data</a>
                  <a href="#">Analysis Tools</a>
                  <a href="#">Learning</a>
                  <a href="#">News</a>
                  <a href="#">Resources</a>
                  <SearchBar fromPortfolio={false} /> {/* Add the SearchBar component */}
                  <a href="#" className="btn btn-primary">Log In</a>
                  <a href="#" className="btn btn-secondary">Register</a>
                </nav>
              </header>
              <main>
                <section className="hero">
                  <h1>Using data to help you trade smarter</h1>
                  <p>CincoData is built by retail investors for retail investors. Learn how to invest and use financial data all in one place.</p>
                </section>
                <section className="features">
                  <div className="feature-card">
                    <img src="/icons/financial-data.svg" alt="Financial Data" />
                    <h3>Financial Data</h3>
                  </div>
                  <div className="feature-card">
                    <img src="/icons/analysis-tools.svg" alt="Analysis Tools" />
                    <h3>Analysis Tools</h3>
                  </div>
                  <div className="feature-card">
                    <img src="/icons/learning.svg" alt="Learning" />
                    <h3>Learning</h3>
                  </div>
                  <div className="feature-card">
                    <img src="/icons/cincodata-plus.svg" alt="CincoData+" />
                    <h3>CincoData+</h3>
                  </div>
                </section>
              </main>
              <footer className="footer">
                <p>&copy; 2024 CincoData. All rights reserved.</p>
              </footer>
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

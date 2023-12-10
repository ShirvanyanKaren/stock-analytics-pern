import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link } from "react-router-dom";
import Auth from "../utils/auth";
import SearchBar from "./SearchBar";
import { idbPromise } from "../utils/helpers";


const Header = () => {
  const handleLogout = async () => {
    const getPortfolioId = async () => {
      const userPortfolio = await idbPromise('stockWeights', 'get', 'portfolio_id');
      console.log(userPortfolio);
      const id = userPortfolio[0].portfolio_id;
      console.log(id);
      return id;
    }
    const portfolioId = await getPortfolioId();
    console.log(portfolioId);
    idbPromise('stockWeights', 'delete', portfolioId);
    Auth.logout();
  };



  return (
    <>
      <Navbar expand="xxl" bg="light" data-bs-theme="light" className="nav-bar nav-bar-custom">
        <Container expand="xxl" className="justify-content-between navbar">
          <Navbar.Brand className="ms-0" to="/home">
            <Link to="/" className="navbar-brand">
              myStocks
            </Link>
          </Navbar.Brand>
          <div className="nav">
            <SearchBar />
            <Nav className="align-items-center ">
              {Auth.loggedIn() ? (
                <Nav.Link to="/" onClick={handleLogout}>
                  Logout
                </Nav.Link>
              ) : (
                <Nav.Link href="/login">Login/Signup</Nav.Link>
              )}
              <Nav.Link to="/features">Dashboard</Nav.Link>
              <Nav.Link to="/pricing">Create Portfolio</Nav.Link>
              <NavDropdown title="Features" id="collapsible-nav-dropdown">
                <NavDropdown.Item href="/stocklinreg">
                  Compare Portfolio
                </NavDropdown.Item>
                <NavDropdown.Item to="/action/3.2">
                  Edit Portfolio
                </NavDropdown.Item>
                <NavDropdown.Item href="/famafrench">
                  Expected Return
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </div>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;

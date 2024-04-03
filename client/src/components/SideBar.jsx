
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import RegressionTool from "./RegressionTool";



const SideBar = () => {
   

    return (
        <>

        <div className="container">
            <Navbar className="col-md-12 d-md-block bg-light sidebar"
            activeKey="/home"
            onSelect={selectedKey => alert(`selected ${selectedKey}`)}
            >
                <div className="sidebar-sticky"></div>
            <Nav.Item>
                <h4> Linear Regression</h4>
            </Nav.Item>
            <Nav.Item>
                <h4> Expected Return</h4>
            </Nav.Item>
            <Nav.Item>
                <h4> 6 Month Price Change </h4>
            </Nav.Item>
            <Nav.Item>
                <h4> Monte Carlo </h4>
            </Nav.Item>
 
            </Navbar>
        </div>
          
        </>
        );

}

export default SideBar;

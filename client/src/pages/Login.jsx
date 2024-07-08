import React, { useEffect, useState } from "react";
import { loginUser, signupUser } from "../services/users";
import { ADD_USER } from "../utils/mutations";
import { SAVE_USER } from "../utils/actions";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import googleLogo from '../assets/google-icon-logo.svg'
import Auth from "../utils/auth";

const Login = () => {
  const [justifyActive, setJustifyActive] = useState("login");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userNameRegex = /^[a-zA-Z0-9]{3,30}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const params = useParams();
  const locationSearch = location.search;

  useEffect(() => {
    if (locationSearch) {
      const token = locationSearch.split("=")[1];
      Auth.login(token);
      Auth.getProfile(token).then((data) => {
        dispatch({
          type: ADD_USER,
          payload: data,
        });
        navigate("/");
      });
    }
  
  }, []);



  useEffect(() => {
    if (location.pathname === "/signup") {
      setJustifyActive("signup");
    }
  }, [location.pathname]);

  const [formState, setFormState] = useState({
    email: "",
    password: "",
    username: "",
    error: "",
  });

  const handleJustifyClick = (value) => {
    if (value === justifyActive) {
      return;
    }
    setFormState({
      email: "",
      password: "",
      username: "",
      error: "",
    });

    setJustifyActive(value);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const validateForm = (formState) => {
    if (!formState.email || !formState.password) {
      setFormState({
        ...formState,
        error: "Please provide all required information.",
      });
      return false;
    } else if (justifyActive === "signup" && !userNameRegex.test(formState.username)) {
      setFormState({
        ...formState,
        error: "Username must be between 3 and 30 characters and contain only letters and numbers.",
      });
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!validateForm(formState)) return;
      if (justifyActive === "login" && !emailRegex.test(formState.email)) [formState.username, formState.email] = [formState.email, formState.username];
      const res = justifyActive === "signup" ? await signupUser(formState) : await loginUser(formState);
      if (res.status !== 200) {  
        let error = res?.response?.data?.message;
        setFormState({
          ...formState,
          error: error,
        });
        throw new Error(res);
      }
      console.log(res)
      const userId = res.data.user.id;
      const token = res.data.token;
      Auth.login(token);
      Auth.getProfile(token).then((data) => {
        dispatch({
          type: SAVE_USER,
          payload: userId,
        });
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="container mt-5 w-50">
      <div className="card p-4">
        <ul className="nav nav-pills mb-3 justify-content-center" id="pills-tab" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${justifyActive === "login" ? "active" : ""}`}
              id="pills-login-tab"
              onClick={() => handleJustifyClick("login")}
            >
              Login
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${justifyActive === "signup" ? "active" : ""}`}
              id="pills-register-tab"
              onClick={() => handleJustifyClick("signup")}
            >
              Register
            </button>
          </li>
        </ul>

        <div className="tab-content" id="pills-tabContent">
          <div
            id="pills-login"
          >
            <form onSubmit={handleFormSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                { justifyActive === "login" ? "Email or Username" : "Email" }
                </label>
                <input
                  type={ justifyActive === "login" ? "text" : "email"}
                  className="form-control"
                  id="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                />
              </div>
              { justifyActive === "login" ? null : (
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={formState.username}
                    onChange={handleChange}
                  />
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={formState.password}
                  onChange={handleChange}
                />
              </div>
              <div className="d-flex justify-content-between mb-3">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="rememberMe" />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember me
                  </label>
                </div>
                <a href="#!">Forgot password?</a>
              </div>
              <button type="submit" className="btn btn-primary w-100">
                { justifyActive === "login" ? "Login" : "Register" }
              </button>
            </form>
            <button type="submit" 
            className="btn btn-light w-100 mt-2"
            onClick={() => {
              window.location.href = 'http://localhost:3001/api/users/google-auth';
            }}
            >
            <span className=''>
               <img 
                className="google-logo"
                src={googleLogo} alt='google logo' /></span>
                { justifyActive === "login" ? "Login with Google" : "Register with Google" } 

            </button>
          </div>

        </div>
        {formState.error && (
          <div className="alert alert-danger mt-3" role="alert">
            {formState.error}
          </div>
        )}
      </div>
    </div>
  );
};




export default Login;

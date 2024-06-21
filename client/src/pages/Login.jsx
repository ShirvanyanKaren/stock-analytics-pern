import React, { useEffect, useState } from "react";
import {
  MDBContainer,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane,
  MDBBtn,
  MDBIcon,
  MDBInput,
  MDBCheckbox,
} from "mdb-react-ui-kit";
import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "../utils/mutations";
import { ADD_USER } from "../utils/mutations";
import { SAVE_USER } from "../utils/actions";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import Auth from "../utils/auth";

const Login = () => {
  const [justifyActive, setJustifyActive] = useState("tab1");
  const [login] = useMutation(LOGIN_USER);
  const [addUser, { error }] = useMutation(ADD_USER);
  const [apolloErrorText, setApolloErrorText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    location.state = localStorage.getItem("redirect") || "/";
    if (Auth.loggedIn()) {
      navigate(location.state);
    }
  }, []);

  useEffect(() => {
    if (location.pathname === "/signup") {
      setJustifyActive("tab2");
    }
  }, [location.pathname]);

  const [formState, setFormState] = useState({
    email: "",
    password: "",
    username: "",
    name: "",
  });

  const handleJustifyClick = (value) => {
    if (value === justifyActive) {
      return;
    }

    setJustifyActive(value);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    try {
      const mutationResponse = await login({
        variables: {
          email: formState.email,
          password: formState.password,
        },
      });
      const token = mutationResponse.data.login.token;
      const userId = mutationResponse.data.login.user.id;
      dispatch({
        type: SAVE_USER,
        payload: userId,
      });
      Auth.login(token);
      console.log(location.state);
      navigate(location.state);
    } catch (e) {
      if (e.graphQLErrors && e.graphQLErrors.length > 0) {
        const errorMessages = e.graphQLErrors.map((error) => error.message);
        let apolloErrorText = "An error occurred while signing in. Please try again.";
        
      }
      console.log(e);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    try {
      console.log(formState);
      const mutationResponse = await addUser({
        variables: {
          email: formState.email,
          password: formState.password,
          username: formState.username,
        },
      });

      console.log(mutationResponse);
      const token = mutationResponse.data.addUser.token;
      Auth.login(token);
      Auth.getProfile(token).then((data) => {
        dispatch({
          type: LOGIN,
          payload: data.data,
        });
        
      });
    } catch (e) {
      if (e.graphQLErrors && e.graphQLErrors.length > 0) {
        const errorMessages = e.graphQLErrors.map((error) => error.message);

        let apolloErrorText =
          "An error occurred while signing up. Please try again.";
        errorMessages.forEach((msg) => {
          if (msg.includes("E11000 duplicate key error")) {
            if (msg.includes("email")) {
              apolloErrorText = `An account with the email ${formState.email} already exists. Please use a different email address.`;
            } else if (msg.includes("username")) {
              apolloErrorText = `The username "${formState.username}" is already taken. Please choose a different username.`;
            }
          }
        });

        setApolloErrorText(apolloErrorText);
      }
    }
  };

  return (
    <MDBContainer className="p-3 my-5 d-flex flex-column w-50 card">
      <MDBTabs
        pills
        justify
        className="mb-3 d-flex flex-row justify-content-between"
      >
        <MDBTabsItem>
          <MDBTabsLink
            onClick={() => handleJustifyClick("tab1")}
            active={justifyActive === "tab1"}
          >
            Login
          </MDBTabsLink>
        </MDBTabsItem>
        <MDBTabsItem>
          <MDBTabsLink
            onClick={() => handleJustifyClick("tab2")}
            active={justifyActive === "tab2"}
          >
            Register
          </MDBTabsLink>
        </MDBTabsItem>
      </MDBTabs>

      <MDBTabsContent>
        <MDBTabsPane show={justifyActive === "tab1"}>
          <form onSubmit={handleLoginSubmit}>
            <label htmlFor="form1" className="form-label">
              Email address
            </label>
            <MDBInput
              onChange={handleChange}
              name="email"
              wrapperClass="mb-4"
              id="form1"
              type="email"
            />
            <label> Password </label>
            <MDBInput
              onChange={handleChange}
              name="password"
              wrapperClass="mb-4"
              id="form2"
              type="password"
            />

            <div className="d-flex justify-content-between mx-4 mb-4">
              <MDBCheckbox
                name="flexCheck"
                value=""
                id="flexCheckDefault"
                label="Remember me"
              />
              <a href="!#">Forgot password?</a>
            </div>

            <MDBBtn type="submit" className="mb-4 w-100">
              Sign in
            </MDBBtn>
          </form>
          <p className="text-center">
            Not a member? <a href="#!">Register</a>
          </p>
        </MDBTabsPane>

        <MDBTabsPane show={justifyActive === "tab2"}>
          <form onSubmit={handleFormSubmit}>
            <label htmlFor="form1" className="form-label">
              Name
            </label>
            <MDBInput
              onChange={handleChange}
              wrapperClass="mb-4"
              name="name"
              id="form1"
              type="text"
            />
            <label htmlFor="form1" className="form-label">
              Username
            </label>
            <MDBInput
              onChange={handleChange}
              wrapperClass="mb-4"
              name="username"
              id="form1"
              type="text"
            />
            <label htmlFor="form1" className="form-label">
              Email address
            </label>
            <MDBInput
              onChange={handleChange}
              wrapperClass="mb-4"
              name="email"
              id="form1"
              type="email"
            />
            <label htmlFor="form1" className="form-label">
              Password
            </label>
            <MDBInput
              onChange={handleChange}
              wrapperClass="mb-4"
              name="password"
              id="form1"
              type="password"
            />

            <div className="d-flex justify-content-center mb-4">
              <MDBCheckbox
                name="flexCheck"
                id="flexCheckDefault"
                label="I have read and agree to the terms"
              />
            </div>

            <MDBBtn type="submit"  className="mb-4 w-100">
              Sign up
            </MDBBtn>
            {apolloErrorText && (
              <div className="alert alert-danger" role="alert">
                {apolloErrorText}
              </div>
            )}
          </form>
        </MDBTabsPane>
      </MDBTabsContent>
    </MDBContainer>
  );
};

export default Login;

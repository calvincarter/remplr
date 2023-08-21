import React, { useState, useEffect } from "react";
import { decodeToken } from "react-jwt";
import useLocalStorage from "./hooks/useLocalStorage";
import "./styles/common/common.css";
import RemplrApi from "./helper/api";
import RouteContainer from "./routeContainer";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/App.css";

const App = () => {
  const [storedToken, setStoredToken] = useLocalStorage("token");
  const [currentUser, setCurrentUser] = useState(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [logout, setLogout] = useState(false);

  // Get user information once we have token from API
  useEffect(() => {
    const getUser = async () => {
      if (storedToken) {
        try {
          let { username } = decodeToken(storedToken);

          let currentUser = await RemplrApi.getUser(username);

          setCurrentUser(currentUser);
          setStoredToken(storedToken);
        } catch (err) {
          setCurrentUser(null);
        }
      }
    };
    getUser();
  }, [storedToken]);

  // Show logout message for 2.5 seconds
  useEffect(() => {
    setTimeout(() => {
      setLogout(false);
    }, 2500);
  }, [logout]);

  /*
  Handles user login
  */
  const handleLogin = async (loginData) => {
    try {
      let token = await RemplrApi.login(loginData.username, loginData.password);
      RemplrApi.setToken(token);
      setStoredToken(token);
      return { success: true };
    } catch (errors) {
      console.error("login failed", errors);
      return { success: false, errors };
    }
  };

  /** Handles register.
   * Automatically logs them in (set token) upon signup.
   *
   */
  const register = async (signupData) => {
    try {
      let token = await RemplrApi.registerNutritionist(signupData);
      RemplrApi.setToken(token);
      return { success: true };
    } catch (errors) {
      console.error("Register failed", errors);
      return { success: false, errors };
    }
  };

  /*
  Handles user logout
  */
  const handleLogout = async () => {
    try {
      RemplrApi.token = null;
      setCurrentUser(null);
      RemplrApi.setToken(null);
      setStoredToken(null);
      setLogout(true);
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      return { success: true };
    } catch (errors) {
      console.error("login failed", errors);
      return { success: false, errors };
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <RouteContainer
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          setToken={setStoredToken}
          justLoggedIn={justLoggedIn}
          setJustLoggedIn={setJustLoggedIn}
          handleLogin={handleLogin}
          register={register}
          handleLogout={handleLogout}
          token={storedToken}
          logout={logout}
        />
      </header>
    </div>
  );
};

export default App;

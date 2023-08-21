import React, { useContext, useEffect } from "react";
import Alert from "../common/alert";
import UserContext from "../common/userContext";

const Header = () => {
  const { currentUser, justLoggedIn, setJustLoggedIn, logout } =
    useContext(UserContext);

  useEffect(() => {
    setTimeout(() => {
      setJustLoggedIn(false);
    }, 3500);
  }, [justLoggedIn, setJustLoggedIn]);

  return (
    <div className="home-header">
      <div className="home-header-top">
        {" "}
        {currentUser && justLoggedIn ? (
          <Alert
            type="success"
            messages={[`Welcome Back ${currentUser.username}!`]}
          />
        ) : null}
        {logout ? <Alert type="success" messages={[`Goodbye!`]} /> : null}
      </div>

      <div className="home-text">
        <h1>REMPLR</h1>
        <small>Meal Plans Made Simple.</small>
      </div>
    </div>
  );
};

export default Header;

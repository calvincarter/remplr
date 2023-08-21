import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/common/nav.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import UserContext from "./userContext";
import Brand from "./brand";

const Nav = ({ handleLogout }) => {
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    let result = handleLogout();
    if (result.success) {
      navigate("/");
    }
  };

  return (
    <>
      {" "}
      <div className="nav-brand">
        <Brand />
      </div>
      <div onClick={() => setMenuOpen(!menuOpen)}>
        <div className="nav-bars">
          <FontAwesomeIcon
            icon={menuOpen ? faTimes : faBars}
            style={menuOpen ? { transform: "rotate(90deg)" } : {}}
          />
        </div>
        <div className={menuOpen ? "nav-item active" : "nav-item"}>
          {currentUser ? (
            <div className="nav-links">
              <Link to="/">Home</Link>
              <Link to="/ingredients">Ingredients</Link>
              <Link to="/recipes">Recipes</Link>
              <Link to="/mealplanner">MealPlanner</Link>
              <Link to="/profile">My Profile</Link>
              <button className="nav-logout" onClick={logout}>
                Log Out
              </button>
            </div>
          ) : (
            <div className="nav-links">
              <Link to="/">Home</Link>
              <Link to={`/login`}>Login</Link>
              <Link to={`/get-started`}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Nav;

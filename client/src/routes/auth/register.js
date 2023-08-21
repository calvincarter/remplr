import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faEnvelope,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/common/auth.css";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../common/alert";

const RegisterForm = ({ register }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
  });
  const [formErrors, setFormErrors] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((l) => ({ ...l, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result = await register(formData);
    if (!result) return <div>loading...</div>;
    if (result.success) {
      navigate("/");
    } else {
      setFormErrors(result.errors);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h1>GET STARTED!</h1>
        <label>
          <FontAwesomeIcon icon={faUser} />
          <input
            type="firstName"
            name="firstName"
            placeholder="enter first name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          <FontAwesomeIcon icon={faUser} />
          <input
            type="lastName"
            name="lastName"
            placeholder="enter last name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          <FontAwesomeIcon icon={faUserCircle} />
          <input
            type="username"
            name="username"
            placeholder="enter username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          <FontAwesomeIcon icon={faEnvelope} />
          <input
            type="email"
            name="email"
            placeholder="enter email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          <FontAwesomeIcon icon={faLock} />
          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="enter password "
            onChange={handleChange}
            required
          />
        </label>
        {formErrors.length ? (
          <Alert type="error" messages={formErrors} />
        ) : null}
        <button
          className="register-button"
          type="submit"
          value="Register"
          onClick={register}
        >
          Sign Up
        </button>
        <p>
          Already Have an Account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;

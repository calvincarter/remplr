import React, { useState, useContext, useEffect } from "react";
import RemplrApi from "../../helper/api";
import UserContext from "../common/userContext";
import Alert from "../common/alert";
import "../../styles/users/profile.css";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { currentUser, setCurrentUser, token } = useContext(UserContext);
  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState([]);
  const [formSuccess, setFormSuccess] = useState("");

  const navigate = useNavigate();

  // Redirect to login page if no user is logged in

  if (!token) {
    navigate("/login");
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((fData) => ({
      ...fData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let profileData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
    };

    if (!currentUser) return null;

    try {
      let updatedUser = await RemplrApi.updateUser(
        currentUser.username,
        profileData
      );

      if (updatedUser.errors) {
        setFormErrors(updatedUser.errors);
        setFormSuccess("");
      } else {
        setFormErrors([]);
        setFormSuccess("Profile updated successfully!");
        setCurrentUser(updatedUser);
      }
    } catch (err) {
      setFormErrors([err.message]);
    }
  };

  return (
    <div className="profile">
      {currentUser && (
        <div className="profile-area">
          <h3>Profile</h3>
          <form onSubmit={handleSubmit} className="profile-form">
            <p>
              <label>Username:</label>
              <input name="username" value={currentUser.username} disabled />
            </p>
            <p>
              <label>First Name:</label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </p>
            <p>
              <label>Last Name:</label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </p>
            <p>
              <label>Email:</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </p>
            <p>
              <label>Confirm password to make changes:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </p>

            {formErrors.length > 0 && (
              <Alert
                type="error"
                messages={["Password is required to update profile"]}
              />
            )}
            {formSuccess && <Alert type="success" messages={[formSuccess]} />}

            <button className="profile-save-button">Save Changes</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Profile;

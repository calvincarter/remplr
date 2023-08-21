import React, { useState } from "react";
import "../../styles/common/alert.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

function Alert({ type = "error", messages = [] }) {
  const [isVisible, setIsVisible] = useState(true);
  const alertClass =
    type === "success" ? "alert-custom-success" : "alert-custom-error";

  if (!isVisible) return null;

  return (
    <div className={`alert ${alertClass}`} role="alert">
      <button
        className="alert-close-button"
        onClick={() => setIsVisible(false)}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      {messages.map((msg, index) => (
        <p key={index}>{msg}</p>
      ))}
    </div>
  );
}

export default Alert;

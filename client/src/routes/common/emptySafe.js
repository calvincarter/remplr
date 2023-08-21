import emptySave from "../../images/emptySave.svg";
import "../../styles/common/emptySave.css";

const EmptySafe = ({ message }) => {
  return (
    <div className="emptyItem">
      <small>{message}</small>
      <img src={emptySave} alt="empty user saved item" />
    </div>
  );
};

export default EmptySafe;

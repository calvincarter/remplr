import logo from "../../images/logo.svg";
import { Link } from "react-router-dom";

const Brand = () => {
  return (
    <div className="brand">
      <Link exact to="/">
        <img src={logo} alt="Remplr logo" />
      </Link>
    </div>
  );
};

export default Brand;

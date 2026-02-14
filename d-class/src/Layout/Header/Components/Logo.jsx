import { Link } from "react-router-dom";
import { useContext } from "react";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import logo from "assests/logos/dclass.png";

const Logo = ({ className = "w-32", onClick }) => {
  const { isAuthenticated } = useContext(LoginAuthContext);
  const to = isAuthenticated ? "/categories" : "/";

  return (
    <Link to={to} onClick={onClick}>
      <img className={className} src={logo} alt="D-Class" />
    </Link>
  );
};

export default Logo;

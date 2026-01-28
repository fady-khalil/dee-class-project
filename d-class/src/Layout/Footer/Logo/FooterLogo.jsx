import logo from "assests/logos/dclass.png";
import { Link } from "react-router-dom";
const FooterLogo = () => {
  return (
    <Link className="w-1/2 sm:w-1/3 lg:w-1/2 xl:w-[80%] block " to="/">
      <img src={logo} alt="logo" />
    </Link>
  );
};

export default FooterLogo;

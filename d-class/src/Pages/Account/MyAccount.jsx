import React from "react";
import Container from "Components/Container/Container";
import { useContext } from "react";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import usePostData from "Hooks/usePostData";
import { useNavigate } from "react-router-dom";
import Spinner from "Components/RequestHandler/Spinner";
const MyAccount = () => {
  const { selectedUser, logoutHandler, token } = useContext(LoginAuthContext);
  const { postData, isLoading, isError } = usePostData();
  const navigate = useNavigate();

  const logout = async () => {
    const response = await postData("logout", {}, token);
    logoutHandler();
    navigate("/");
  };
  return (
    <div>
      <Container>
        <h1>My Account</h1>

        <button
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-x-2"
          onClick={logout}
        >
          {isLoading ? <Spinner isWhite={true} /> : "Logout"}
        </button>

        <button>Profiles</button>
      </Container>
    </div>
  );
};

export default MyAccount;

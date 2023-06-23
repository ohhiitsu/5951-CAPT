import SignIn from "../components/Auth/SignIn";
import SignUp from "../components/Auth/SignUp";
import AuthDetails from "../components/AuthDetails";

function Login() {
  return (
    <>
      <SignIn />
      <SignUp />
      <AuthDetails />
    </>
  );
}

export default Login;

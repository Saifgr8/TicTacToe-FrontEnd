import React, { useState } from "react";
import AuthUI from "./authUI";
import { useForm } from "react-hook-form";
import authServices from "../../api/axios/authAxios";
import { useGoogleLogin } from "@react-oauth/google";
import { useLocation, useNavigate } from "react-router-dom";

const Auth = () => {
  const [formErrors, setFormErrors] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const location = useLocation();

  //SIGN IN
  const signIn = async (data) => {
    const loginData = {
      email: data.loginEmail,
      password: data.loginPassword,
    };
    setFormErrors("");
    try {
      const responseData = await authServices.login(loginData);
      const playerUsername = responseData.username;
      localStorage.setItem("username", playerUsername);
      navigate("/");
    } catch (error) {
      setFormErrors(error);
    }
  };

  //SIGN UP
  const signUp = async (data) => {
    const registerData = {
      email: data.registerEmail,
      username: data.username,
      password: data.registerPassword,
    };
    setFormErrors("");
    try {
      const responseData = await authServices.register(registerData);
      if (responseData) {
        setIsFlipped(true);
      }
    } catch (error) {
      setFormErrors(error);
    }
  };

  //  GOOGLE LOGIN
  const handleGoogleLoginSucess = async (tokenResponse) => {
    setFormErrors("");
    try {
      const responseData = await authServices.googleLoginSucess(tokenResponse);
      const playerUsername = responseData.username;
      localStorage.setItem("username", playerUsername);
      navigate("/");
    } catch (error) {
      setFormErrors(error);
    }
  };
  const handleGoogleLoginFailure = async (errors) => {
    const errorResponse = await authServices.handleGoogleLoginError(errors);
    setFormErrors(errorResponse);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleLoginSucess,
    onError: handleGoogleLoginFailure,
    scope: "email profile openid",
  });

  return (
    <div>
      {" "}
      <div className="flex justify-center items-center min-h-screen ">
        <AuthUI
          register={register}
          handleSubmit={handleSubmit}
          signIn={signIn}
          signUp={signUp}
          errors={errors}
          watch={watch}
          formErrors={formErrors}
          loginRequired={location.state?.loginRequired === true}
          isFlipped={isFlipped}
          setIsFlipped={setIsFlipped}
          googleLogin={googleLogin}
        />
      </div>
    </div>
  );
};

export default Auth;

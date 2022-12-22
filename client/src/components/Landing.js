import react, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
const img = require("./penguin.png");

const Landing = () => {
  const [errMessage, setErrMessage] = useState("");
  const navigate = useNavigate();

  // If the user is already logged in, go straight to home
  useEffect(() => {
    $.get("http://localhost:3000/getUser", (data, status) => {
      if (data !== "") {
        navigate("/home");
      }
    });
    $("#password").on("keypress", (e) => {
      if (e.which === 13) {
        handleLogin();
      }
    });
    $("#login").on("click", () => {
      handleLogin();
    });
  }, []);

  // Login function
  handleLogin = () => {
    const username = $("#username").val();
    const password = $("#password").val();

    if (username.length === 0) {
      setErrMessage("Username must be filled");
    } else if (password.length === 0) {
      setErrMessage("Password must be filled");
    } else {
      $.post(
        "http://localhost:3000/login",
        { username, password },
        function (data, status) {
          if (data === "err1") {
            setErrMessage("User not found");
          } else if (data === "err2") {
            setErrMessage("Password incorrect");
          } else {
            navigate("/home");
          }
        }
      );
    }
  };

  return (
    <>
      <div style={{ height: "100vh", padding: "5vh" }} className="w-100">
        <div
          style={{ marginBottom: "12vh" }}
          className="d-flex justify-content-center"
        >
          <img
            className="m-auto text-center text-light"
            src={img}
            width="25"
          ></img>
        </div>
        <h2 className="text-center mb-2">Pennbook</h2>
        <form className="m-auto p-4 rounded">
          <div style={{ width: "22vw" }} className="form-floating mb-2 m-auto">
            <input
              id="username"
              className="form-control"
              placeholder="Username"
            />
            <label className="text-secondary" htmlFor="floatingInput">
              Username
            </label>
          </div>
          <div style={{ width: "22vw" }} className="form-floating mb-4 m-auto">
            <input
              id="password"
              className="form-control"
              type="password"
              placeholder="Password"
            />
            <label className="text-secondary" htmlFor="floatingInput">
              Password
            </label>
          </div>
          <p className="text-danger text-center">{errMessage}</p>
          <div className="m-auto text-center mb-3">
            <button
              style={{ width: "22vw" }}
              type="button"
              id="login"
              className="p-2 btn btn-success"
            >
              Continue
            </button>
          </div>
          <p className="m-auto text-center fw-light">
            Don't have an account?{" "}
            <a href="/signup" className="text-success text-decoration-none">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </>
  );
};

export default Landing;

import react, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
const img = require("./penguin.png");

// Component for signup page
const Signup = () => {
  const [errMessage, setErrMessage] = useState("");
  const [interests, setInterests] = useState([]);
  const navigate = useNavigate();

  // setting event listeners for when a user signs up
  useEffect(() => {
    $("#interests_input").on("keypress", (e) => {
      if (e.which === 13) handleAdd();
    });

    $("#submit").on("click", () => {
      const first_name = $("#first_name").val();
      const last_name = $("#last_name").val();
      const username = $("#username").val();
      const email = $("#email").val();
      const password = $("#password").val();
      const birth_day = $("#birth_day").val();
      const birth_month = $("#birth_month").val();
      const birth_year = $("#birth_year").val();
      const birthday = birth_day + "-" + birth_month + "-" + birth_year;
      const affiliation = $("#affiliation").val();
      const interest_list = getInterests();

      if (first_name.length === 0) {
        setErrMessage("First name cannot be empty");
      } else if (last_name.length === 0) {
        setErrMessage("Last name cannot be empty");
      } else if (username.length === 0) {
        setErrMessage("Username cannot be empty");
      } else if (email.length < 5 || !email.includes("@") || !email.includes(".")) {
        setErrMessage("Please enter a valid email");
      } else if (password.length < 6 || !/\d/.test(password)) {
        setErrMessage(
          "Password must be greater than 6 characters and contain at least one digit"
        );
      } else if (
        birth_day.length > 2 ||
        birth_day.length === 0 ||
        /\D/.test(birth_day)
      ) {
        setErrMessage("Please enter a valid birth day");
      } else if (
        birth_month.length > 2 ||
        birth_month.length === 0 ||
        /\D/.test(birth_month)
      ) {
        setErrMessage("Please enter a valid birth month");
      } else if (birth_year.length !== 4 || /\D/.test(birth_year)) {
        setErrMessage("Please enter a valid birth year");
      } else if (affiliation.length === 0) {
        setErrMessage("Affiliation cannot be empty");
      } else if (interest_list.length === 0) {
        setErrMessage("Add at least 2 interests");
      } else {
        $.post(
          "http://localhost:3000/signup",
          {
            username,
            password,
            first_name,
            last_name,
            email,
            affiliation,
            birthday,
            interests: interest_list,
          },
          (data, status) => {
            if (data === "err1") {
              setErrMessage("User already exists");
            } else if (data === "err2") {
              setErrMessage("error occured");
            } else {
              navigate("/home");
            }
          }
        );
      }
    });
  }, []);

  getInterests = () => {
    return interests;
  };

  handleAdd = () => {
    const interest = $("#interests_input").val();
    if (!interests.includes(interest)) {
      setInterests((old) => [...old, interest]);
    }
    $("#interests_input").val("");
  };

  return (
    <>
      <div style={{ height: "100vh", padding: "5vh" }} className="w-100">
        <div
          style={{ marginBottom: "6vh" }}
          className="d-flex justify-content-center"
        >
          <img
            className="m-auto text-center text-light"
            src={img}
            width="25"
          ></img>
        </div>
        <h2 className="text-center mb-3">Create your account</h2>
        <form>
          <div className="d-flex justify-content-center">
            <div
              style={{ width: "15vw" }}
              className="form-floating mb-3 d-inline"
            >
              <input
                id="first_name"
                className="form-control"
                placeholder="First name"
              />
              <label className="text-secondary" htmlFor="floatingInput">
                First name
              </label>
            </div>
            <div style={{ width: "1vw" }}></div>
            <div
              style={{ width: "15vw" }}
              className="form-floating mb-3 d-inline"
            >
              <input
                id="last_name"
                className="form-control"
                placeholder="Last name"
              />
              <label className="text-secondary" htmlFor="floatingInput">
                Last name
              </label>
            </div>
          </div>
          <div style={{ width: "31vw" }} className="m-auto form-floating mb-3 ">
            <input
              id="username"
              className="form-control"
              placeholder="Username"
            />
            <label className="text-secondary" htmlFor="floatingInput">
              Username
            </label>
          </div>
          <div style={{ width: "31vw" }} className="m-auto  form-floating mb-3">
            <input
              id="password"
              className="form-control"
              placeholder="Password"
            />
            <label className="text-secondary" htmlFor="floatingInput">
              Password
            </label>
          </div>
          <div style={{ width: "31vw" }} className="m-auto form-floating mb-3">
            <input id="email" className="form-control" placeholder="Email" />
            <label className="text-secondary" htmlFor="floatingInput">
              Email
            </label>
          </div>
          <div className="d-flex justify-content-center">
            <div
              style={{ width: "15vw" }}
              className="form-floating mb-3 d-inline"
            >
              <input
                id="affiliation"
                className="form-control"
                placeholder="Affiliation"
              />
              <label className="text-secondary" htmlFor="floatingInput">
                Affiliation
              </label>
            </div>
            <div style={{ width: "1vw" }}></div>
            <div style={{ width: "15vw" }} className="input-group">
              <div className="form-floating">
                <input
                  id="birth_day"
                  className="form-control"
                  placeholder="DD"
                />
                <label className="text-secondary" htmlFor="floatingInput">
                  DD
                </label>
              </div>
              <div className="form-floating">
                <input
                  id="birth_month"
                  className="form-control"
                  placeholder="MM"
                />
                <label className="text-secondary" htmlFor="floatingInput">
                  MM
                </label>
              </div>
              <div className="form-floating">
                <input
                  id="birth_year"
                  className="form-control"
                  placeholder="YY"
                />
                <label className="text-secondary" htmlFor="floatingInput">
                  YY
                </label>
              </div>
            </div>
          </div>
          <div style={{ width: "31vw" }} className="m-auto input-group mb-2">
            <div className="form-floating">
              <input
                id="interests_input"
                className="form-control"
                placeholder="Interests"
              />
              <label className="text-secondary" htmlFor="floatingInput">
                Interests
              </label>
            </div>
            <button
              id="add_interest"
              onClick={() => handleAdd()}
              className="btn btn-outline-success"
              type="button"
            >
              Add
            </button>
          </div>
          <div style={{ width: "31vw" }} className="m-auto">
            {interests &&
              interests.map((elem) => {
                return (
                  <>
                    <span className="p-2 mx-2 mb-1 badge rounded-pill fw-light text-bg-success">
                      {elem}
                    </span>
                  </>
                );
              })}
            {interests.length == 0 && (
              <span className="p-2 mx-2 mb-1 badge rounded-pill text-bg-success fw-light invisible">
                hi
              </span>
            )}
          </div>
          <p className="text-danger text-center">{errMessage}</p>
          <div className="m-auto text-center mb-3">
            <button
              style={{ width: "31vw" }}
              type="button"
              id="submit"
              className="p-2 m-auto btn btn-success"
            >
              Continue
            </button>
          </div>
          <p className="m-auto text-center fw-light">
            Already have an account?{" "}
            <a href="/" className="text-success text-decoration-none">
              Log in
            </a>
          </p>
        </form>
      </div>
    </>
  );
};

export default Signup;

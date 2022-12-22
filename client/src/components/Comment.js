import React from "react";
import { useState, useEffect } from "react";
import $ from "jquery";

const Comment = ({ author, comment_id, date, content }) => {
  const currDate = new Date(date).toString();
  const [profileURL, setProfileURL] = useState("");
  const [affiliation, setAffiliation] = useState("");

  useEffect(() => {
    $.post(
      "http://localhost:3000/getWallInformation",
      { user: author },
      (data, status) => {
        setProfileURL(data.profile_url);
        setAffiliation(data.affiliation);
      }
    );
  }, []);

  return (
    <div className="row mt-2 mb-4 mx-3">
      <div style={{ flex: "0 0 auto", width: "11%" }} className="mt-2">
        <img
          className="align-self-center rounded-circle"
          width="50"
          height="50"
          src={`${profileURL}`}
        />
      </div>
      <div
        style={{ backgroundColor: "#e3dfde" }}
        className="px-3 pb-3 pt-2 col-10 rounded-bottom rounded-end text-start"
      >
        <div className="fs-5 d-flex justify-content-between">
          <div>{author}</div>
          <div className="fs-6 fw-light">{currDate.substring(0, 16)}</div>
        </div>
        <div className="fw-light mb-2">{affiliation}</div>
        <p className="card-text">{content}</p>
      </div>
    </div>
  );
};

export default Comment;

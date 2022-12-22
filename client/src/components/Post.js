import React, { useEffect, useState } from "react"
import $ from "jquery"
import Comment from "./Comment"
import { v4 as uuidv4 } from 'uuid';

// Component for posts
const Post = ({ user, wall, content, type, date, visitingUser }) => {
  const [commentContent, setCommentContent] = useState('')
  const [comments, setComments] = useState([])
  const [profileURL, setProfileURL] = useState("")
  const [affiliation, setAffiliation] = useState("")

  const currDate = new Date(date).toString()
  const post_identifier = `${user}#${wall}#${date}`

  // Get the wall information and comments of a post
  useEffect(() => {
    $.post("http://localhost:3000/getWallInformation", {user}, (data, status) => {
      setProfileURL(data.profile_url)
      setAffiliation(data.affiliation)
    })
  },[])

  useEffect(() => {
    $.post("http://localhost:3000/getComments", { post_identifier }, (data, status) => {
      if (data !== "no comments") {
        setComments(data)
      }
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      $.post("http://localhost:3000/getComments", { post_identifier }, (data, status) => {
        if (data !== "no comments") {
          setComments(data)
        }
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const addComment = () => {
    const now = `${Date.now()}`
    const comment_id = uuidv4()
    const comment = commentContent
    setCommentContent('')
    $.post("http://localhost:3000/addComment", { author: visitingUser, comment_id, post_identifier, date: now, content: comment }, (data, status) => {
      if (data === "Comment cannot have empty content!") {
        alert(data)
      } if (data !== "Success") {
        alert(`Error while commenting`)
      } else {
        const commentObj = {
          author: {S: visitingUser},
          comment_id: {S: comment_id},
          content: {S: commentContent},
          date: {N: now}
        }
        let newComments = [...comments]
        newComments.push(commentObj)
        setComments([...newComments])
      }
    })
  }

  return (
    <div className="card mb-4 m-auto shadow">
      <div className="card-body">
        <div className="row mb-2">
          <div style={{flex: "0 0 auto", width: "11%"}}>
            <img className="align-self-center rounded-circle" width="50" height="50" key={profileURL} src={`${profileURL}`} />
          </div>
          <div className="col-10 text-start">
            <div className="fs-5">{user}</div>
            <div className="fw-light">{affiliation}</div>
          </div>
        </div>
        <p className="text-start card-text px-2">{content}</p>
        <div className="d-flex justify-content-between">
          <div className="fw-light">{currDate.substring(0, 16)}</div>
          <div className="fw-light">Posted on: {wall}</div>
        </div>
        {
          type === "Post" && (
            <div className="input-group input-group-sm mt-2">
              <textarea
                className="form-control"
                onChange={(e) => setCommentContent(e.target.value)}
                value={commentContent}>
              </textarea>
              <button className="btn btn-outline-primary input-group-text" onClick={() => addComment()}>
                Comment
              </button>
            </div>
          )
        }
      </div>
      <div>
        {
          comments.map(comment => (
            <div key={parseInt(comment.date.N)}>
              <Comment
                author={comment.author.S}
                date={parseInt(comment.date.N)}
                content={comment.content.S}>
              </Comment>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Post

/* -------------
Routes for posts
---------------*/

const db = require("../models/postsdb")

const getPostsForUser = function (req, res) {
  const { username } = req.body
  db.get_posts_for_user(username, function (err, data) {
    if (err || data === "user has no posts") {
      res.send("no posts")
    } else {
      res.send(data)
    }
  })
}

const addPost = function(req, res) {
  const { username, author, post_id, type, content } = req.body
  if (content === '' || content === undefined) {
    res.send("Post cannot have empty content!")
  }
  db.add_post(username, author, post_id, type, content, function (err, data) {
    if (err) {
      res.send(err)
    } else if (data !== "Success" && data !== "Successfully added to both walls") {
      res.send(data)
    } else {
      res.send("Success")
    }
  })
}

const deletePost = function(req, res) {
  const { username, post_id } = req.body
  
}

const posts_routes = {
  get_posts_for_user: getPostsForUser,
  add_post: addPost,
  delete_post: deletePost,
}

module.exports = posts_routes

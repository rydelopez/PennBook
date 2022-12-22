/* -------------------
Database Access Routes
---------------------*/
const AWS = require("aws-sdk")
AWS.config.update({ region: "us-east-1" })
const db = new AWS.DynamoDB()
const async = require("async")

/* -------------------
Tables: posts, comments
---------------------*/

/* posts */
const addPost = (username, author, post_id, type, content, callback) => {
  if (type !== "Post" && type !== "Status Update") {
    callback(null, "Post type is required")
  } else {
    var params = {
      Item: {
        username: {
          S: username,
        },
        author: {
          S: author,
        },
        wall: {
          S: username,
        },
        post_id: {
          N: post_id,
        },
        type: {
          S: type,
        },
        content: {
          S: content,
        }
      },
      TableName: "posts",
      ReturnValues: "NONE",
    }
    db.putItem(params, function (err, data) {
      if (err) {
        callback(err)
      } else {
        //a post on another person's wall should also show up on their list of posts
        if (username !== author) {
          var params1 = {
            Item: {
              username: {
                S: author,
              },
              author: {
                S: author,
              },
              wall: {
                S: username,
              },
              post_id: {
                N: post_id,
              },
              type: {
                S: type,
              },
              content: {
                S: content,
              }
            },
            TableName: "posts",
            ReturnValues: "NONE",
          }
          db.putItem(params1, function (err, data) {
            if (err) {
              callback(err)
            } else {
              callback(null, "Successfully added to both walls")
            }
          })
        } else {
          callback(null, "Success")
        }
      }
    })
  }
}

const getPostsForUser = (username, callback) => {
  var params = {
    KeyConditions: {
      username: {
        ComparisonOperator: "EQ",
        AttributeValueList: [{ S: username }],
      },
    },
    TableName: "posts",
    ScanIndexForward: false,
  }

  db.query(params, function(err, data) {
    if (err || data.Items.length === 0) {
      callback(err, "user has no posts")
    } else {
      callback(null, data.Items)
    }
  })
}

const deletePost = (username, post_id) => {

}

/* comments */
const addComment = (post_identifier, comment_id, content, date, author, callback) => {
  var params = {
    Item: {
      post_identifier: {
        S: post_identifier,
      },
      comment_id: {
        S: comment_id,
      },
      content: {
        S: content,
      },
      author: {
        S: author,
      },
      date: {
        N: date,
      },
    },
    TableName: "comments",
    ReturnValues: "NONE",
  }
  db.putItem(params, function (err, data) {
    if (err) {
      callback(err)
    } else {
      callback(null, "Successfully added a comment")
    }
  })
}

const getCommentsForPost = (post_identifier, callback) => {
  var params = {
    KeyConditions: {
      post_identifier: {
        ComparisonOperator: "EQ",
        AttributeValueList: [{ S: post_identifier }],
      },
    },
    TableName: "comments"
  }
  
  db.query(params, function(err, data) {
    if (err || data.Items.length === 0) {
      callback(err, "post has no comments")
    } else {
      callback(null, data.Items)
    }
  })
}

const database = {
  add_post: addPost,
  get_posts_for_user: getPostsForUser,
  delete_post: deletePost,
  add_comment: addComment,
  get_comments_for_post: getCommentsForPost
}
  
  module.exports = database
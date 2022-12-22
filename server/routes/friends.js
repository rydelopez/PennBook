/* ---------------
Routes for friends
-----------------*/

const { response } = require("express")
const db = require("../models/database")
const timestamp = require("./timestamp")

const requestFriend = async (req, res) => {
  res.send("TODO")
}

const addFriend = async (req, res) => {
  const { sender, receiver } = req.body

  db.add_friend(sender, receiver, function (err, data) {
    if (err) {
      res.send("Error occured when adding friend")
    } else {
      timestamp.internalUpdateTimestamp(sender)
      res.send(data)
    }
  })
}

const removeFriend = async (req, res) => {
  const { sender, receiver } = req.body

  db.remove_friend(sender, receiver, function (err, data) {
    if (err) {
      res.send("Error occured when removing friend")
    } else {
      timestamp.internalUpdateTimestamp(sender)
      res.send(data)
    }
  })
}

const getFriends = async (req, res) => {
  const { username } = req.body

  db.get_friends(username, function (err, data) {
    if (err) {
      res.send("Error occured when searching for friends")
    } else {
      const friendships = data
      res.send(friendships)
    }
  })
}

const friend_routes = {
  get_friends: getFriends,
  remove_friend: removeFriend,
  add_friend: addFriend,
  remove_friend: removeFriend,
  request_friend: requestFriend,
}

module.exports = friend_routes

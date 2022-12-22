/* -----------------------
Routes for account changes
------------------------*/

const db = require("../models/database")
const CryptoJS = require("crypto-js")
const timestamp = require("./timestamp")

const changeEmail = async (req, res) => {
  const { username, email } = req.body
  //somehow check if it's the logged-in user changing their email
  if (req.session.user === username) {
    //db calls for updating email
    db.update_email(username, email, function (err, data) {
      if (err || data === "unable to update email") {
        res.send("unable to update email")
      } else {
        timestamp.internalUpdateTimestamp(username)
        res.send(data)
      }
    })
  }
}

const changePassword = async (req, res) => {
  const { username, password } = req.body
  //somehow check if it's the logged-in user changing their email
  if (req.session.user === username) {
    //hash the password
    var hash = CryptoJS.SHA256(password).toString()
    //db calls for updating password
    db.update_password(username, hash, function (err, data) {
      if (err || data === "unable to update password") {
        res.send("unable to update password")
      } else {
        timestamp.internalUpdateTimestamp(username)
        res.send(data)
      }
    })
  }
}

const changeAffiliation = async (req, res) => {
  const { username, affiliation } = req.body
  //somehow check if it's the logged-in user changing their email
  if (req.session.user === username) {
    //db calls for updating affiliation
    db.update_affiliation(username, affiliation, function (err, data) {
      if (err || data === "unable to update affiliation") {
        res.send("unable to update affiliation")
      } else {
        timestamp.internalUpdateTimestamp(username)
        res.send(data)
      }
    })
  } else {
    res.send("user has no access permissions")
  }
}

const changeProfile = async (req, res) => {
  const { username, profile } = req.body
  //somehow check if it's the logged-in user changing their email
  if (req.session.user === username) {
    //db calls for updating profile
    db.update_profile(username, profile, function (err, data) {
      if (err || data === "unable to update profile") {
        res.send("unable to update profile")
      } else {
        timestamp.internalUpdateTimestamp(username)
        res.send(data)
      }
    })
  } else {
    res.send("user has no access permissions")
  }
}

const addInterest = async (req, res) => {
  const { username, newInterest } = req.body
  //somehow check if it's the logged-in user changing their email
  if (req.session.user === username) {
    //db calls for adding interest
    db.add_interest(username, newInterest, function (err, data) {
      if (err || data === "unable to add interests") {
        res.send("failed to add interest")
      } else {
        timestamp.internalUpdateTimestamp(username)
        res.send("Success")
      }
    })
  }
}

const deleteInterest = async (req, res) => {
  const { username, interest } = req.body
  //somehow check if it's the logged-in user changing their email
  if (req.session.user === username) {
    //db calls for deleting interest
    db.remove_interest(username, interest, function (err, data) {
      if (err) {
        res.send("failed to remove interest")
      } else {
        timestamp.internalUpdateTimestamp(username)
        res.send("Success")
      }
    })
  }
}



const account_routes = {
  delete_interest: deleteInterest,
  add_interest: addInterest,
  change_affiliation: changeAffiliation,
  change_password: changePassword,
  change_email: changeEmail,
  change_profile: changeProfile,
}

module.exports = account_routes

const db = require("../models/database")

const updateTimestamp = async (req, res) => {
  const { username } = req.body

  db.update_timestamp(username, function (err, data) {
    if (err || data === "user not found") {
      res.send("err1")
    } else {
      res.send("updated timestamp")
    }
  })
}

const internalUpdateTimestamp = (username) => {
  db.update_timestamp(username, function (err, data) {
    if (err || data === "user not found") {
      console.log(err)
    } else {
      // Update timestamp success
    }
  })
}

const getTimestamp = async (req, res) => {
  const { username } = req.body

  db.get_user_info(username, function (err, data) {
    if (err || data === "user not found") {
      res.send("err1")
    } else {
      res.send(data.last_time)
    }
  })
}

const registration_routes = {
  update_timestamp: updateTimestamp,
  get_timestamp: getTimestamp,
  internalUpdateTimestamp: internalUpdateTimestamp,
}

module.exports = registration_routes

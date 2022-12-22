var express = require("express");
var session = require("express-session");
var routes = require("./routes/routes");
var cors = require("cors");
const path = require("path");
const db = require("./models/database");
const postsdb = require("./models/postsdb");

// Initialization
var app = express();
var server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "https://localhost:1234",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

const users = {};

app.use(cors({ credentials: true, origin: "http://localhost:1234" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "loginSecret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(express.static("dist"));

// listening for incoming sockets
io.on("connection", async (socket) => {
	socket.on("join_room", (data) => {
		socket.join(data);
	});
	socket.on("start_chat", async (data) => {
		var oldRoom = data.room;
		const usersInOldRoom = await io.in(oldRoom).fetchSockets();
		var members = [];
		if (oldRoom !== "") {
			for (const user of usersInOldRoom) {
				members.push(user.data.username);
			}
			members.push(data.user);
		} else {
			members = [data.inviter, data.user].sort();
		}
		var members = members.sort();
		var room = members.join("");
		db.get_chat(room, function (err, data2) {
			if (err) {
				console.log(err);
			} else {
				if (typeof data2 !== "undefined") {
					socket.join(room);
					if (oldRoom !== "") {
						usersInOldRoom.forEach((user) => {
							socket.to(users[user.data.username]).emit("load_chat", data2); // to others in old room
						});
					} else {
						socket.to(users[data.inviter]).emit("load_chat", data2); // to inviter
					}
					io.to(room).emit("load_chat", data2); // to self
				} else {
					db.create_chat(room, members, function (err, data3) {
						if (err) {
							console.log(err);
						} else {
							socket.join(room);
							socket.to(users[data.inviter]).emit("chat_invite_accepted", room);
							io.to(room).emit("chat_invite_accepted", room);
						}
					});
				}
			}
		});
	});
	socket.on("leave_chat", (data) => {
		socket.leave(data.room);
		const messageData = {
			author: data.user,
			message: data.user + " just left.",
			time: new Date(Date.now()),
		};
		socket.to(data.room).emit("user_left", messageData);
	});
	socket.on("send_message", (data) => {
		db.send_message(
			data.room,
			data.author,
			data.message,
			data.time,
			function (err, data2) {
				if (err) {
					console.log(err);
				} else {
					io.to(data.room).emit("receive_message", data);
				}
			}
		);
	});
	socket.on("get_online_friends", (data) => {
		socket.data.username = data;
		users[socket.data.username] = socket.id;
		io.fetchSockets().then((sockets) => {
			var onlineUsers = [];
			sockets.forEach((s) => {
				onlineUsers.push(s.data.username);
			});
			db.get_online_friends(
				socket.data.username,
				onlineUsers,
				function (err, data) {
					if (err) {
						console.log(err);
					} else {
						socket.emit("load_online_friends", data);
					}
				}
			);
		});
	});
	socket.on("invite_to_chat", (data) => {
		const inviteData = {
			name: socket.data.username,
			id: socket.id,
			room: data.room,
		};
		socket.to(users[data.friend]).emit("receive_invite", inviteData);
	});
	socket.on("disconnect", () => {
		console.log("User disconnected", socket.id);
	});
});

server.listen(3000, () => {
	console.log("listening on 3000");
});

// Routes
app.post("/signup", routes.signup)
app.post("/searchNews", routes.search_news)
app.post("/login", routes.login)
app.post("/logout", routes.logout)
app.post("/changeEmail", routes.change_email)
app.post("/changePassword", routes.change_password)
app.get("/getUser", routes.get_user)
app.post("/searchUser", routes.search_user)
app.post("/getWallInformation", routes.get_wall_information)
app.post("/changeAffiliation", routes.change_affiliation)
app.post("/changeProfile", routes.change_profile)
app.post("/getFriends", routes.get_friends)
app.post("/addPost", routes.add_post)
app.post("/getPosts", routes.get_posts_for_user)
app.post("/addFriend", routes.add_friend)
app.post("/removeFriend", routes.remove_friend)
app.post("/updateTimestamp", routes.update_timestamp)
app.post("/getTimestamp", routes.get_timestamp)
app.post("/addInterest", routes.add_interest)
app.post("/deleteInterest", routes.delete_interest)
app.post("/addComment", routes.add_comment)
app.post("/getComments", routes.get_comments_for_post)
app.get("/getArticle/:id", routes.get_article);
app.post("/getRecommendedArticle", routes.get_recommended_article);
app.post("/toggleArticleLike", routes.toggle_article_like);

// set favicon
app.get("/favicon.ico", (req, res) => {
  res.status(404).send();
});

// set the initial entry point
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});


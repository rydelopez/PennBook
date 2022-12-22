Team Members:
Jason Ren: jren2
Brian Williams: bewill
Ryan de Lopez: vdelopez
Susan Zhang: szhang25

Features Implemented:

- In this project, we implemented a facebook themed around Penn students. This allows users to sign up and login
  with hashed password accounts, change their information (while maintaining security such that other users cannot change others' information) such as affiliation, interests, password and email, add friends, search for friends, comment on friends' posts with dynamicism and persistence, chat with others and get news suggested to them. All of this information is persistent and maintains on login. Along with these features, each user has their own wall where they can view their own posts and posts made on their wall. They will also have a home page to view status updates, new friendships, and profile updates made by friends. This app also allows the user to view their network of friends and those with similar affiliations.
  Overall, this application implements all required features from the NETS2120 final project handout.

Extra Credit:
- This project also implements dynamic and persistent profile pictures and persistent group chat messages.  

External Libraries:
- axios: https://github.com/axios/axios
  - Used in conjunction with jQuery to send XMLHttpRequests
- Bootstrap: https://getbootstrap.com/
  - Used for styling
- concurrently: https://www.npmjs.com/package/concurrently
  - Allows for multiple commands to run concurrently (used for deployment)
- CryptoJS: https://cryptojs.gitbook.io/docs/
  - Used for SHA256 hashing of passwords
- jQuery: https://jquery.com/
  - Used for DOM manipulation and XMLHttpRequests
- parcel: https://parceljs.org/
  - Used for deployment of frontend and backend
- react: https://reactjs.org/
  - Used as our frontend framework
- react-graph-vis: https://www.npmjs.com/package/react-graph-vis
  - Used for visualization of graph network
- react-router-dom: https://reactrouter.com/en/main
  - Used for routing
- react-scroll-to-bottom: https://www.npmjs.com/package/react-scroll-to-bottom
  - Auto scrolls our container for chat
- socket.io: https://socket.io/
  - Used for websocket communication from server to client
- stemmer: https://www.npmjs.com/package/stemmer
  - Used for stemming words in news search
- uuid: https://www.npmjs.com/package/uuid
  - Used to create id's for comments
  
Source files included:

G22
| news
| | src
| | | main
| | | | java
| | | | | edu
| | | | | | upenn
| | | | | | | cis
| | | | | | | | nets2120
| | | | | | | | | news
| | | | | | | | | | config
| | | | | | | | | | | Config.java
| | | | | | | | | | livy
| | | | | | | | | | | ComputeRanksLivy.java
| | | | | | | | | | | MyPair.java
| | | | | | | | | | | NewsRankJob.java
| | | | | | | | | | storage
| | | | | | | | | | | DynamoConnector.java
| | | | | | | | | | | SparkConnector.java
| | | | | | | | | | App.java
| | | | | | | | | | ComputeRanks.java
| | | test
| | | | java
| | | | | edu
| | | | | | upenn
| | | | | | | cis
| | | | | | | | nets2120
| | | | | | | | | news
| | | | | | | | | | AppTest.java
| loadNewsDB.mjs
| pom.xml
| table_results_friends.txt
| table_results_news.txt
| table_results_users.txt
| client
| | src
| | | components
| | | | icons
| | | | | AddedFriend.js
| | | | | AddFriend.js
| | | | | DeleteButton.js
| | | | | Edit.js
| | | | | Heart.js
| | | | | HeartFill.js
| | | | | OfflineFriend.js
| | | | | OnlineFriend.js
| | | | | PendingFriend.js
| | | | | Profile.js
| | | | Chat.js
| | | | Comment.js
| | | | Error.js
| | | | Header.js
| | | | Home.js
| | | | Landing.js
| | | | logout.png
| | | | penguin.png
| | | | Post.js
| | | | Signup.js
| | | | Socket.js
| | | | Visualizer.js
| | | | Wall.js
| | | App.css
| | | App.js
| | | index.html
| | | index.js
| server
| | models
| | | database.js
| | | postsdb.js
| | routes
| | | account.js
| | | comments.js
| | | friends.js
| | | news.js
| | | posts.js
| | | registration.js
| | | routes.js
| | | timestamp.js
| | | utility.js
| | index.js
| loader.js
| package.json

Declaration that all ofthe code you are submitting was written by us:
Brian Williams bewill
Ryan deLopez vdelopez
Susan Zhang szhang25
Jason Ren jren2

Running this project:
To run this project, from branch master, navigate to directory G22 in terminal, run "npm install", and run "npm run dev".

## News
1. `mvn package`
2. `mvn exec:java@local`
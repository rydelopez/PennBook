import React, { useEffect, useState } from "react";
import Header from "./Header";
import $ from "jquery";
import Post from "./Post";
import Chat from "./Chat";
import socket from "./Socket";
import OfflineFriend from "./icons/OfflineFriend";
import OnlineFriend from './icons/OnlineFriend'
import Heart from "./icons/Heart";
import HeartFill from "./icons/HeartFill";
import {stemmer} from 'stemmer'

// Home page has many features
const Home = () => {
	const [user, setUser] = useState("");
	const [friends, setFriends] = useState([]);
	const [friendsList, setFriendsList] = useState([]);
	const curr_date = Date.now();
	// posts are sorted in ascending order
	const [posts, setPosts] = useState([]);
  const [searchArticle, setSearchArticle] = useState('')
  const [searchedNews, setSearchedNews] = useState([])
  const [newsFeed, setNewsFeed] = useState([]);

  const getFullArticle = (id) => {
    var article;
    $.get(`http://localhost:3000/getArticle/${id}`, (data, status) => {
      article = data[0]?.link.S;
    });
    return article;
  };

	useEffect(() => {
      socket.on("load_online_friends", (data) => {
        var onlineFriends = data.online;
        setFriendsList(onlineFriends);
      });
	}, []);

  // use effect to get user information along with friends 
  useEffect(() => {
		$.get("http://localhost:3000/getUser", (data, status) => {
			const username = data;
			setUser(username);
			$.post(
				"http://localhost:3000/getFriends",
				{ username: data },
				(data, status) => {
          const postPromises = [];
					let postList = [];
					if (data === "user has no friends") {
						setFriends([]);
					} else if (typeof data === "string") {
						setFriends([]);
					} else {
						const promises = [];
						const friend_list = [];
						data.forEach(function (individual_friend) {
							promises.push(
								$.post(
									"http://localhost:3000/getWallInformation",
									{ user: individual_friend.receiver.S },
									(friend_data, status) => {
										friend_list.push({
											friend: friend_data.username,
											status: individual_friend.status.N,
											last_time: friend_data.last_time,
										});
									}
								)
							);
						});
						Promise.all(promises).then((values) => {
							setFriends(friend_list);
						});

						data.forEach((friend) => {
							if (friend.status.N == 1) {
								postPromises.push(
									$.post(
										"http://localhost:3000/getPosts",
										{ username: friend.receiver.S },
										(dataResponse, status) => {
											if (dataResponse !== "no posts") {
												const newList = [...dataResponse];
												postList = postList.concat(newList);
											}
										}
									)
								);
							}
						});
					}
          postPromises.push(
            $.post(
              "http://localhost:3000/getPosts",
              { username },
              (dataResponse, status) => {
                if (dataResponse !== "no posts") {
                  const newList = [...dataResponse];
                  postList = postList.concat(newList);
                }
              }
            )
          );
          Promise.all(postPromises).then((values) => {
            const filteredPosts = postList.reduce((acc, current) => {
              const x = acc.find(post => 
                (post.post_id.N === current.post_id.N) && (post.author.S === current.author.S)
              );
              if (!x) {
                return acc.concat([current]);
              } else {
                return acc;
              }
            }, []);
            filteredPosts.sort((a, b) => (a.post_id.N > b.post_id.N ? -1 : 1));
            setPosts([...filteredPosts]);
          });
				}
			);
			socket.emit("get_online_friends", data);
		});
	}, []);

  // keep reloading for friends
  useEffect(() => {
    const interval = setInterval(() => {
      if (user != '' && user != undefined) {
        $.post(
          "http://localhost:3000/getFriends",
          { username: user },
          (data, status) => {
            const postPromises = [];
            let postList = [];
            if (data === "user has no friends") {
              setFriends([]);
            } else if (typeof data === "string") {
              setFriends([]);
            } else {
              const promises = [];
              const friend_list = [];
              data.forEach(function (individual_friend) {
                promises.push(
                  $.post(
                    "http://localhost:3000/getWallInformation",
                    { user: individual_friend.receiver.S },
                    (friend_data, status) => {
                      friend_list.push({
                        friend: friend_data.username,
                        status: individual_friend.status.N,
                        last_time: friend_data.last_time,
                      });
                    }
                  )
                );
              });
              Promise.all(promises).then((values) => {
                setFriends(friend_list);
              });
              data.forEach((friend) => {
                if (friend.status.N == 1) {
                  postPromises.push(
                    $.post(
                      "http://localhost:3000/getPosts",
                      { username: friend.receiver.S },
                      (dataResponse, status) => {
                        if (dataResponse !== "no posts") {
                          const newList = [...dataResponse];
                          postList = postList.concat(newList);
                        }
                      }
                    )
                  );
                }
              });
            }
            postPromises.push(
              $.post(
                "http://localhost:3000/getPosts",
                { username: user },
                (dataResponse, status) => {
                  if (dataResponse !== "no posts") {
                    const newList = [...dataResponse];
                    postList = postList.concat(newList);
                  }
                }
              )
            );
            Promise.all(postPromises).then((values) => {
              const filteredPosts = postList.reduce((acc, current) => {
                const x = acc.find(post => 
                  (post.post_id.N === current.post_id.N) && (post.author.S === current.author.S)
                );
                if (!x) {
                  return acc.concat([current]);
                } else {
                  return acc;
                }
              }, []);
              filteredPosts.sort((a, b) => (a.post_id.N > b.post_id.N ? -1 : 1));
              setPosts([...filteredPosts]);
            });
          }
        );
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [user]) 

  // method to search for articles based on the input field
  const searchForArticles = () => {
    if (searchArticle.length > 0) {
      let words = searchArticle.toLowerCase()
      words = words.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"") // remove all punctuation
      .replace(/\s{2,}/g," ")                  // fix spaces
      words = words.split(" ")

      words = words.map(function(word) {
        return stemmer(word)
      })

      $.post("http://localhost:3000/searchNews", { words }, (data, response) => {
          let sort_news = [];
          for (var news in data) {
              sort_news.push([news, data[news]]);
          }

          sort_news.sort(function(a, b) {
              return b[1].count - a[1].count;
          });

          setSearchedNews(sort_news)
        }
      )
    }
  }

	return (
		<>
    <style>
      {`
        #overflow-div::-webkit-scrollbar {
          display: none;
        }
      `}
    </style>
    <div>
			<Header></Header>
			<div className="container text-center">
				<div className="row">
					<div className="col-3">
            <button
              type="button"
              className="btn btn-primary m-auto mb-2"
              onClick={() => {
                $.post(
                  "http://localhost:3000/getRecommendedArticle",
                  { username: user },
                  (data, status) => {
                    setNewsFeed(newsFeed.concat([data]));
                  }
                );
              }}
            >
              Recommend an article!
            </button>
            { newsFeed.length > 0 && (
              <div style={{height:"30vh"}} className="mb-2 overflow-auto">
                {newsFeed.map((article) => (
                  <div className="bg-light m-1 p-3 rounded">
                    <div className="text-end">
                      <div
                        role="button"
                        onClick={() => {
                          // update locally
                          var newNewsFeed = newsFeed.filter(
                            (a) => a.news_id.S != article.news_id.S
                          );
                          newNewsFeed.push({
                            ...article,
                            likes: article?.likes?.SS?.includes(user)
                              ? article.likes.SS.filter((u) => u != user)
                              : article.likes?.SS
                              ? article.likes.SS.concat([user])
                              : [user],
                          });
                          setNewsFeed(newNewsFeed);

                          $.post(
                            "http://localhost:3000/toggleArticleLike",
                            { username: user, id: article.news_id.S },
                            (data, status) => {
                            }
                          );
                        }}
                      >
                        {article?.likes?.SS?.includes(user) ? (
                          <HeartFill />
                        ) : (
                          <Heart />
                        )}
                      </div>
                    </div>
                    <a href={article.link.S}>{article.headline.S}</a>
                    <p>{article.short_description.S}</p>
                  </div>
                ))}
              </div>
            )}
            <div>
              <div class="input-group mb-3">
                <input id="search-input"
                  onChange={(e) => setSearchArticle(e.target.value)}
                  type="search"
                  className="form-control"
                  placeholder="Search for an article..."
                  aria-label="Search"
                />
                <button type="button" onClick={() => searchForArticles()} class="btn btn-outline-primary">Search</button>
              </div>
            </div>
            <div style={{height:"45vh"}} className="text-start overflow-auto">
            {
              searchedNews.map((news) => (
                <div className="row border rounded mx-3 my-2 py-2">
                  <div className="col-12">
                    <a href={`${news[1].link}`} target="_blank">{news[1].headline}</a>
                    <p></p>
                    <div>{news[1].authors} • <span className="fw-light">{news[1].category}</span></div>
                  </div>
                </div>
              )
            )}
            </div>
          </div>


					<div id="overflow-div" style={{height:"90vh", overflow: "auto"}} className="col-6 text-center">
              {posts.map((post) => (
                <div key={parseInt(post.post_id.N)}>
                  <Post
                    user={post.author.S}
                    wall={post.wall.S}
                    content={post.content.S}
                    type={post.type.S}
                    date={parseInt(post.post_id.N)}
                    visitingUser={user}
                  ></Post>
                </div>
							))}
					</div>
					<div className="col-3">
            <div style={{height: "27vh"}}>
              <h4 className="text-center">Friends</h4>
              {friends.length === 0 && (
                <>
                  <div>No friends</div>
                </>
              )}
              {friends.length > 0 &&
                typeof friends != "string" &&
                friends.map((elem) => {
                  return (
                    <div className="d-flex my-2">
                    {curr_date - parseInt(elem.last_time) > 300000 ? (
                      <>
                        <span className="d-inline">
                          <OfflineFriend></OfflineFriend>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="d-inline">
                          <OnlineFriend></OnlineFriend>
                        </span>
                      </>
                    )}
                      <a
                        href={`/wall?user=${elem.friend}`}
                        className="text-decoration-none d-inline pe-auto mx-2"
                      >
                        {elem.friend}
                      </a>
                    </div>
                  );
                })}
              </div>
              <h4>
                Group chats
              </h4>
              <div>
                <Chat userName={user} friends={friendsList} />
              </div>
					</div>
				</div>
			</div>
      </div>
    </>
  );
};

export default Home;

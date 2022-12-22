/* ---
Routes
-----*/
const account_routes = require("./account");
const friend_routes = require("./friends");
const registration_routes = require("./registration");
const utility_routes = require("./utility");
const posts_routes = require("./posts");
const timestamp_routes = require("./timestamp");
const comments_route = require("./comments");
const news_route = require("./news");

// Routes object
const routes = {
  update_timestamp: timestamp_routes.update_timestamp,
  get_timestamp: timestamp_routes.get_timestamp,
  login: registration_routes.login,
  logout: registration_routes.logout,
  signup: registration_routes.signup,
  change_email: account_routes.change_email,
  change_password: account_routes.change_password,
  change_affiliation: account_routes.change_affiliation,
  change_profile: account_routes.change_profile,
  add_interest: account_routes.add_interest,
  delete_interest: account_routes.delete_interest,
  search_user: utility_routes.search_user,
  get_user: utility_routes.get_user,
  search_news: utility_routes.search_news,
  get_wall_information: utility_routes.get_wall_information,
  get_friends: friend_routes.get_friends,
  remove_friend: friend_routes.remove_friend,
  add_friend: friend_routes.add_friend,
  request_friend: friend_routes.request_friend,
  add_post: posts_routes.add_post,
  get_posts_for_user: posts_routes.get_posts_for_user,
  delete_post: posts_routes.delete_post,
  add_comment: comments_route.add_comment,
  get_comments_for_post: comments_route.get_comments_for_post,
  get_article: news_route.get_article,
  get_recommended_article: news_route.get_recommended_article,
  toggle_article_like: news_route.toggle_article_like,
};

module.exports = routes;

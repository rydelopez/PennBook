/* -------------------
Routes related to news
---------------------*/

const db = require("../models/database");

function weighted_random(items) {
  var i;

  var weights = [];

  for (i = 0; i < items.length; i++)
    weights[i] = items[i].value + (weights[i - 1] || 0);

  var random = Math.random() * weights[weights.length - 1];

  for (i = 0; i < weights.length; i++) if (weights[i] > random) break;

  return items[i].node;
}

const getRecommendedArticle = async (req, res) => {
  const { username } = req.body;

  db.get_articles_for_user(username, function (err, data) {
    if (err) {
      res.send("Error occured when getting a news recommendation: " + err);
    } else {
      db.get_article(weighted_random(data).split("#")[1], function (err, data) {
        if (err) {
          res.send("Error occured when retrieving an article: " + err);
        } else {
          res.send(data.Items[0]);
        }
      });
    }
  });
};

const toggleArticleLike = async (req, res) => {
  const { id, username } = req.body;

  db.toggle_article_like(id, username, function (err, data) {
    if (err) {
      res.send("Error occured when liking article: " + err);
    } else {
      res.send(data);
    }
  });
};

const getArticle = async (req, res) => {
  const { id } = req.params;

  db.get_article(id, function (err, data) {
    if (err) {
      res.send("Error occured when retrieving an article: " + err);
    } else {
      res.send(data);
    }
  });
};

const news_routes = {
  get_recommended_article: getRecommendedArticle,
  get_article: getArticle,
  toggle_article_like: toggleArticleLike,
};

module.exports = news_routes;

import AWS from "aws-sdk";
import fetch from "node-fetch";
import { stemmer } from "stemmer";

AWS.config.update({ region: "us-east-1" });
const db = new AWS.DynamoDB();

const loadNews = async () => {
  const stopwords = [
    "stop",
    "the",
    "to",
    "and",
    "a",
    "in",
    "it",
    "is",
    "I",
    "that",
    "had",
    "on",
    "for",
    "were",
    "was",
  ];

  fetch(
    "https://penn-cis545-files.s3.amazonaws.com/News_Category_Dataset_v2.json"
  )
    .then((response) => response.text())
    .then((response) => {
      const entries = response
        .split("\r\n")
        .slice(0, 100)
        .map((n, i) => ({ id: i.toString(), ...JSON.parse(n) }));

      entries.forEach((e) => {
        const date = new Date(Date.parse(e.date));
        date.setFullYear(date.getFullYear() + 5);

        const keywords = e.short_description
          .split(" ")
          .filter((word) => !stopwords.includes(word))
          .filter((word) => word)
          .map(stemmer)
          .map((word) =>
            word
              .toLowerCase()
              .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // remove all punctuation
              .replace(/\s{2,}/g, " ")
          ); // fix spaces

        keywords.forEach((keyword) => {
          var params = {
            TableName: "newsSearch",
            Item: {
              keyword: { S: keyword },
              news_id: { S: e.id },
              link: { S: e.link },
              category: { S: e.category },
              headline: { S: e.headline },
              authors: { S: e.authors },
              short_description: { S: e.short_description },
              date: { S: date.toString() },
            },
          };

          db.putItem(params, function (err, data) {
            console.log(err);
            console.log(data);
          });
        });
      });
    })
    .catch((err) => console.log(err));
};

loadNews();

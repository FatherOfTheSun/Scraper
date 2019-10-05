var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(express.static(process.cwd() + "/public"));

var exphbs = require("express-handlebars");
app.engine("handlbars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder


// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scraper4", { useNewUrlParser: true, useUnifiedTopology: true });

var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("connected");
});

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.popularmechanics.com").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $("article h2").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });

        // Send a message to the client
        res.send("Scrape Complete");
    });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // Find all comments
    db.Article.find({})
        .then(function (dbArticle) {
            // If all comments are successfully found, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurs, send the error back to the client
            res.json(err);
        });

    // TODO: Finish the route so it grabs all of the articles
});

// Route for grabbing a specific Article by id, populate it with it's comment
app.get("/articles/:id", function (req, res) {
    db.comment.find({})
        // Specify that we want to populate the retrieved libraries with any associated books
        .populate("Comment")
        .then(function (dbArticle) {
            // If any Libraries are found, send them to the client with any associated Books
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurs, send it back to the client
            res.json(err);
        });
    // TODO
    // ====
    // Finish the route so it finds one article using the req.params.id,
    // and run the populate method with "comment",
    // then responds with the article with the comment included
});

// Route for saving/updating an Article's associated comment
app.post("/articles/:id", function (req, res) {
    db.comment.create(req.body)
        .then(function (dbcomment) {
            // If a comment was created successfully, find one User (there's only one) and push the new comment's _id to the User's `comments` array
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({}, { $push: { comment: dbcomment._id } }, { new: true });
        })
        .then(function (dbArticle) {
            // If the User was updated successfully, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurs, send it back to the client
            res.json(err);
        });
    // TODO
    // ====
    // save the new comment that gets posted to the comments collection
    // then find an article from the req.params.id
    // and update it's "comment" property with the _id of the new comment
});




// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});


require('dotenv').config();
var express = require('express');
var exphb = require('express-handlebars')
var mongoose= require('mongoose');
var axios = require('axios');
var cheerio = require('cheerio');
//mongoose.connect('mongodb://localhost/my_database');
//Initialize Express
//import dotenv from 'dotenv';


//Database config
var db = require("./models");

//Connecting moongoose config. to the db variable
//var db = mongoose.model(databaseUrl, collections);
//var PORT = 3000;
var app = express();
// Use morgan logger for logging requests
//app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI||process.env.MONGOLAB_YELLOW_URI;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });







app.get("/scrape", function(req, res){
    //res.send("Hello world");



//Making request via axios for DailyMail site
axios.get("https://www.dailymail.co.uk/ushome/index.html").then(function(response){
    //load response into cheerio and save it to a variable
    var $ = cheerio.load(response.data);

    //empty array for data
    //console.log(response.data);


   
    //var resultsTwo = [];

    //cheerio finding title class
    $(".article"/*, '<div class="cleared lead-alpha">...</div>'*/).each(function(i, element){
        //save text of title

        var results = {};
        //console.log(element);
        var dailyUrl = "www.dailymail.co.uk";
        results.title = $(this).children("h2").text(); 


        results.link = dailyUrl + $(this).children("h2").children("a").attr("href"); 

        
        results.description = $(this).find("p").text();
        
        //save these results in an object

     

       db.Article.create(results)
        .then(function(dbArticle){
          console.log(dbArticle);
        })
      
        .catch(function(err){
          console.log(err);
        });
        
      
       //console.log(results);

    //});
    // If this found element had both a title and a link
   /*if (title && link && description) {
        // Insert the data in the scrapedData db
        db.scrapedData.insert({
          title: title,
          link: link,
          description:description
        },
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(inserted);
          }
        });
   }*/
    });
  

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});

});


//Main route 

//Retrieve data from the db
app.get("/articles", function(req, res){
    //Find all results from the scrapedData coll3d5ion in the db
    db.Article.find({}) .then(function(dbArticle) {
        res.json(dbArticle);
        //errors
    })
    .catch(function(err){
        res.json(err)
    });

});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Rout// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});



// Listen on port 3000
/*app.listen("mongodb://lbogle:bootcamp1984@ds135704.mlab.com:35704/heroku_l1jlj3rp", function() {
  console.log("App running on port 3000!");
});*/


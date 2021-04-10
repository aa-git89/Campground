const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");

mongoose.connect("mongodb://localhost:27017/yelp-camp",  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

let model = require('./models/campground.js');

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({
    extended: true
  }));

app.use(express.static("public"));

app.use(methodOverride("_method"));

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/campgrounds', async (req, res) => {
   const campgrounds = await Campground.find({});
   res.render("campgrounds/index", {campgrounds})
});

app.get('/campgrounds/new', (req, res) => {
    res.render("campgrounds/new")
 });

app.get("/campgrounds/:id", async(req, res) => {
    const requestedId = req.params.id;

  
    Campground.findById({
      _id: requestedId
    }, function(err, campground) {
  
      res.render("campgrounds/show", { campground
      });
  
    });
  
  });

  app.get("/campgrounds/:id/edit", async(req, res) => {
    const requestedId = req.params.id;

  
    Campground.findById({
      _id: requestedId
    }, function(err, campground) {
  
      res.render("campgrounds/edit", { campground
      });
  
    });
  
  });

  app.post("/campgrounds", function(req, res) {
    const campground = new Campground(req.body.campground);
  
  
    campground.save(function(err) {
      if (!err) {
        res.redirect(`/campgrounds/${campground._id}`);
      }
    });
  
  
   });

   app.put("/campgrounds/:id", async(req, res) =>{
       const requestedId = req.params.id;
       const campground = await Campground.findByIdAndUpdate(requestedId, 
        { ...req.body.campground});
       res.redirect(`/campgrounds/${campground._id}`);

   });

   app.delete("/campgrounds/:id", async(req, res) => {
    const requestedId = req.params.id;
    await Campground.findByIdAndDelete(requestedId);
    res.redirect("/campgrounds");
   });

app.listen(3000, function(){
    console.log("Starting port 3000");
});
const express = require("express");
const app = express();
const ejsMate = require("ejs-mate");
const {campgroundSchema} = require("./schemas")
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
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

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({
    extended: true
  }));

app.use(express.static("public"));

app.use(methodOverride("_method"));

const validateCampground = (req, res, next) => {
 
  const {error} = campgroundSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el => el.message).join(",")
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/campgrounds', catchAsync(async (req, res) => {
   const campgrounds = await Campground.find({});
   res.render("campgrounds/index", {campgrounds})
}));

app.get('/campgrounds/new', (req, res) => {
    res.render("campgrounds/new")
 });

app.get("/campgrounds/:id", catchAsync(async(req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/show", { campground });
  
  }));

  app.get("/campgrounds/:id/edit", catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });

  
  }));

  app.post("/campgrounds", validateCampground, catchAsync(async(req, res, next) => {
      
      const campground = new Campground(req.body.campground);
      await campground.save()
      res.redirect(`/campgrounds/${campground._id}`);
      
   }));

   app.put("/campgrounds/:id", validateCampground, catchAsync(async(req, res) =>{
       const requestedId = req.params.id;
       const campground = await Campground.findByIdAndUpdate(requestedId, 
        { ...req.body.campground});
       res.redirect(`/campgrounds/${campground._id}`);

   }));

   app.delete("/campgrounds/:id", catchAsync(async(req, res) => {
    const requestedId = req.params.id;
    await Campground.findByIdAndDelete(requestedId);
    res.redirect("/campgrounds");
   }));

   app.all('*', (req, res, next) => {
      next(new ExpressError("Page Not found", 404));
   });

   app.use((err, req, res, next) => {
     const { statusCode = 500} = err;
     if(!err.message) err.message = "Boy, something went wrong";
     res.status(statusCode).render("error", {err});
   });

app.listen(3000, function(){
    console.log("Starting port 3000");
});
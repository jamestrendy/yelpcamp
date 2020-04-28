var express = require("express");
//crete a new instance of the express router
var router = express.Router({mergeParams: true}); 
var Campground = require("../models/campground");
var middleware = require("../middleware")

//CAMPGROUNDS INDEX ROUTE - Show all campgrounds
router.get("/", function(req,res) {

    //Get all campgrounds from the db
    Campground.find({}, function(err, allcampgrounds){
        if(err) {
            console.log(err);
        }
        else {
            res.render("campgrounds/index", {campgrounds: allcampgrounds, currentUser: req.user});
        }
    })
    // res.render("campgrounds", {campgrounds: campgrounds});

});

//CAMPGROUNDS CREATE ROUTE - Add a new campground to database
router.post("/", middleware.isLoggedIn, function(req,res) {
    //get data from form and add to campground array
    var name = req.body.name; 
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, price: price, image: image, description: desc, author: author};
    //Create a new campground and save to db
    Campground.create(newCampground, function(err, newlyCreated){
        if(err) {
            console.log(err);
            req.flash("error", "Campground could not be added");
        }
        else {
            req.flash("success", "Campground successfully added");
            res.redirect("/campgrounds");   
        }
    })
    
})

//CAMPGROUNDS NEW ROUTE - Show form to create a new campground
router.get("/new", middleware.isLoggedIn, function(req,res) {
    res.render("campgrounds/new"); 
})

//CAMPGROUNDS SHOW ROUTE - Shows more info about one campground
router.get("/:id", function(req,res) {     
    //find the campground with the provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if (err) {
            console.log(err);
        }
        else {
             //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//CAMPGROUND EDIT ROUTE

router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

   

//UPDATE CAMPGROUND ROUTE 

router.put("/:id", middleware.checkCampgroundOwnership, function(req,res) {
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
        if(err) {
            res.redirect("/campgrounds");
            req.flash("error", "Campground could not be updated");
        }
        else {
            res.redirect("/campgrounds/" + req.params.id);
            req.flash("success", "Campground successfully updated")
        }
    })
});

//DESTROY CAMPGROUND ROUTE 

router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res) {
    Campground.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            res.redirect("/campgrounds");
        }
        else {
            res.redirect("/campgrounds")
        }
    })
});

module.exports = router;
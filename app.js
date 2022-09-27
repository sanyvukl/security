//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const ejs = require("ejs");


const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
/* It is important to place "Session" under all app.use()*/
app.use(session({
    secret: "Little secret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

let time = [3];

app.get("/", function(req, res){
    res.render("home");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    User.register({username: req.body.username}, req.body.password,
        function(err, user){
            if(err){
                console.log(err);
                res.redirect("/register");
            }else{
                passport.authenticate("local")(req,res, function(){
                    res.redirect("/secret");
                });
            }
        });
    });
    
app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", function(req, res){
    time[0] = new Date();
    time[0] = time[0].getHours() +":"+time[0].getMinutes() +":"+time[0].getSeconds();
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });    
    
    req.login(user, function(err){
        if(!err){
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secret");
            });
        }else{
            console.log(err);
        }
    })
});

app.get("/secret", function(req, res){
    time[1] = new Date();
    time[1] = time[1].getHours() +":"+time[1].getMinutes() +":"+time[1].getSeconds();

    console.log("Start : " + time[0]);
    console.log("End : " + time[1]);
    if(req.isAuthenticated()){
        time[2] = time[1] - time[0]; 
        console.log("Process : " + time[2]);
        res.render("secrets");
    }else{
        console.log("User is not auth");
        res.redirect("/login");
    }
});

app.get("/logout", function(req,res){
    req.logout(function(err){
        if(err){
            console.log(err);
        }
    });
    res.redirect("/");
})
app.listen(3000, function(req, req){
    console.log("Server is running on port 3000");
});

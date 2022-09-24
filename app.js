//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const ejs = require("ejs");


const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true})

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);


app.get("/", function(req, res){
    res.render("home");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", (req, res)=>{

    bcrypt.hash(req.body.userPassword, saltRounds,
        function(err, hash){
            
        const newUser = new User({
            email: req.body.userEmail,
            password: hash
        });
        newUser.save(function(err){
            if(!err){
               res.render("secrets");
            }else{
                console.log(err);
            }
        });
    });
});

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", function(req, res){
    const email =  req.body.userEmail;
    const password = req.body.userPassword;

    User.findOne(
        {email: email},
        function(err, foundUser){
            /* const hash = foundUser.password; */
            /* hash = $2c123p12nrpi.... because we are reading from database */
            if(!err && foundUser){
                bcrypt.compare(password,  foundUser.password, function(err, result){
                    if(result){
                        res.render("secrets");
                    }
                });
            }else{
                res.send(err||"Check your email or password");
            }
        }
    );
})

app.get("/logout", function(req,res){
    res.redirect("/");
})
app.listen(3000, function(req, req){
    console.log("Server is running on port 3000");
});
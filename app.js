//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true})

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const secret = "Thisisoursecret.";
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]});

const User = mongoose.model("User", userSchema);


app.get("/", function(req, res){
    res.render("home");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", (req, res)=>{
    const newUser = new User({
        email: req.body.userEmail,
        password: req.body.userPassword
    });
    newUser.save(function(err){
        if(!err){
           res.render("secrets");
        }else{
            console.log(err);
        }
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
            if(!err && foundUser && foundUser.password === password){
                res.render("secrets");
            }else{
                res.send(err||"Check your email or password");
            }
        }
    );
})

app.listen(3000, function(req, req){
    console.log("Server is running on port 3000");
});
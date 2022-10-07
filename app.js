//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser")
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const session = require("express-session");
const passport =  require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");


const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "ourlittlesecret",
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

//mongoose.connect("mongodb+srv://dhrupad_sah:hvdycohKVGEnDtop@cluster0.8gepm9r.mongodb.net/secretsDB2",{useNewUrlParser: true});
mongoose.connect("mongodb://localhost:27017/secretsDB",{useNewUrlParser: true});

const loginSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String
});

loginSchema.plugin(passportLocalMongoose);
loginSchema.plugin(findOrCreate)

const loginModel = new mongoose.model("loginModel", loginSchema);

passport.use(loginModel.createStrategy());

passport.serializeUser(loginModel.serializeUser());
passport.deserializeUser(loginModel.deserializeUser());

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

const secretsSchema = new mongoose.Schema({
    secrets:String
});


//loginSchema.plugin(encrypt,{secret: process.env.SECRET,encryptedFields: ["password"]});



const secretsModel = new mongoose.model("secretsModel", secretsSchema);


app.post("/register",(req,res)=>{

    loginModel.register({username: req.body.username}, req.body.password, (e,user)=>
    {
        if(e)
        {
            console.log(e);
            res.redirect("/register");
        }
        else
        {
            passport.authenticate("local")(req,res,()=>{
                res.redirect("/secrets");
            });
        }
    });

})

app.post("/login",(req,res)=>{
 
const User = new loginModel({
    username: req.body.username,
    password: req.body.password
});

req.login(User, (e)=>{
    if(e)
    {
        console.log(e);
        res.render("failure");
    }
    else{
        passport.authenticate("local")(req,res,()=>
        {
            res.redirect("/secrets");
        });
    }
})

});

app.get("/logout",(req,res)=>
{
    req.logout((e)=>
    {
        if(e)
        {
            console.log(e);
        }
    });

    res.redirect("/");
})

app.get("/",(req,res)=>
{
    res.render("home");
});

app.get("/auth/google", (req,res)=>
{
    passport.authenticate("google", {scope: ["profile"]})
});

app.get("/login",(req,res)=>
{
    res.render("login");
});

app.get("/register",(req,res)=>
{
    res.render("register");
});

app.get("/auth/google/secrets",
passport.authenticate("google",{failureRedirect: "/login"}),
(req,res)=>
{
    res.redirect("/secrets")
}
 );

app.get("/confessions",(req,res)=>
{
    if(req.isAuthenticated())
    {
        res.render("secrets");
    }
    else
    {
        res.redirect("/login");
    }
});

app.get("/submit", (req,res)=>
{
    res.render("submit");
})

// app.get("/confessions", (req,res)=>
// {
//     secretsModel.find({},(err,list)=>{
//         console.log(res);
//         res.render("confessions",{list:list});
//     });
    
// })

app.post("/submit",(req,res)=>
{
    const secretins = new secretsModel({
        secrets: req.body.secret
    })
    secretins.save();

    res.render("confessions");
    
})

app.listen(process.env.PORT||3000, ()=>
{
    console.log("Server running on port 3000");
});
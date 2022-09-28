//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser")
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");

app.use(bodyParser.urlencoded({
    extended: true
}));

//mongoose.connect("mongodb+srv://dhrupad_sah:hvdycohKVGEnDtop@cluster0.8gepm9r.mongodb.net/secretsDB2",{useNewUrlParser: true});
mongoose.connect("mongodb://localhost:27017/secretsDB",{useNewUrlParser: true});

const loginSchema = new mongoose.Schema({
    _id: String,
    password: String,
});

const secretsSchema = new mongoose.Schema({
    secrets:String
})

const loginModel = new mongoose.model("loginModel", loginSchema);

const secretsModel = new mongoose.model("secretsModel", secretsSchema);

app.post("/register",(req,res)=>{

    const loginCreds = new loginModel ({
        _id: req.body.username,
        password: req.body.password
    })

    loginCreds.save((e)=>
    {
        if(e)
        {
            console.log(e);
        }
        else
        {
            res.redirect("/");
        }
    });
})

app.post("/login",(req,res)=>{

    const emailA = req.body.username;
    const passwo = req.body.password;

    loginModel.findById(emailA,(e,response)=>{
        if(!e)
        {
            res.redirect("/secrets");   
        }
        else{
            console.log(e);
        }
    });

    
});

app.get("/logout",(req,res)=>
{
    res.render("home");
})

app.get("/",(req,res)=>
{
    res.render("home");
});

app.get("/login",(req,res)=>
{
    res.render("login");
});

app.get("/register",(req,res)=>
{
    res.render("register");
});

app.get("/secrets",(req,res)=>
{
    res.render("secrets");
});

app.get("/submit", (req,res)=>
{
    res.render("submit");
})

app.get("/success", (req,res)=>
{
    res.render("success");
})

app.get("/confessions", (req,res)=>
{
    res.render("confessions");
})

app.post("/submit",(req,res)=>
{
    const secretins = new secretsModel({
        secrets: req.body.secret
    })
    
    secretins.save();

    res.render("success");
    
})

app.listen(3000, ()=>
{
    console.log("Server running on port 3000");
});
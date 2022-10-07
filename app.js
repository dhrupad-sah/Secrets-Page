//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser")
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");


const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");

app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb+srv://saipranith:HaFkUhxKJsTELFRK@cluster0.htyqh.mongodb.net/usersDB?retryWrites=true&w=majority",{ useNewUrlParser: true })
// mongoose.connect("mongodb://localhost:27017/secretsDB",{useNewUrlParser: true});

const loginSchema = new mongoose.Schema({
    email: String,
    password: String,
});

const secretsSchema = new mongoose.Schema({
    secrets:String
});


loginSchema.plugin(encrypt,{secret: process.env.SECRET,encryptedFields: ["password"]});

const loginModel = new mongoose.model("loginModel", loginSchema);

const secretsModel = new mongoose.model("secretsModel", secretsSchema);

app.post("/register",(req,res)=>{

    const loginCreds = new loginModel ({
        email: req.body.username,
        password: md5(req.body.password)
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
    const passwo = md5(req.body.password);

    loginModel.findOne({email: emailA},(e,response)=>{
        if(e)
        {
            console.log(e);
        }
        
            else if(response.password===passwo)
            {
                res.render("secrets");
            }

            else
            {
                res.render("failure");
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
    secretsModel.find({},(err,list)=>{
        console.log(res);
        res.render("confessions",{list:list});
    });
    
})

app.post("/submit",(req,res)=>
{
    const secretins = new secretsModel({
        secrets: req.body.secret
    })
    secretins.save();

    res.render("success");
    
})
app.get("/home",(req,res)=>{
    res.render("screen");
})

app.listen(process.env.PORT||3000, ()=>
{
    console.log("Server running on port 3000");
});
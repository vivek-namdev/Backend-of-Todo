const express = require("express");
const bcrypt = require('bcrypt');
const {UserModel, TodoModel} = require("./db");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const JWT_SECRET = "asdasd123@123";

mongoose.connect("mongodb+srv://viveknamdev018:8e3ToWcBwTMIOMTP@cluster0.r2qd2.mongodb.net/todo-vivek-2222");
const app = express();
app.use(express.json());

app.post("/signup", async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    
    await UserModel.create({
        email: email,
        password: password,
        name: name
    })

    res.json({
        message: "You are logged in"
    })
})

app.post("/signin", async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({
        email: email,
        password: password
    })

    console.log(user);

    if(user) {
        const token = jwt.sign({
        id: user._id.toString()
    }, JWT_SECRET)
        res.json({
            token: token
        })
    } else {
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }
})

app.post("/todo", auth, async function(req, res) {
    const {title, done} = req.body;

    const userId = req.userId;

    try {
        await TodoModel.create({userId, title, done});

        res.status(201).json({message: "Todo created!"});
    } catch (error) {
        res.status(500).json({message: "Error creating todo"});
    }
    
})

app.get("/todos", auth, async function(req, res) {
    const userId = req.userId;

    try {
        const todos = await TodoModel.find({userId});

        if(todos) {
            res.status(200).json(todos);
        } else {
            res.json({message: "No todos found"});
        }
    } catch (error) {
        res.status(500).json({message: "Error fetching todos"});
    }
})

function auth(req, res, next) {
    const token = req.headers.token;

    const decodedData = jwt.verify(token, JWT_SECRET);

    if(decodedData) {
        req.userId = decodedData.id;
        next();
    } else {
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }
}

app.listen(3000)
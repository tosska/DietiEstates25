import express from "express";
import morgan from "morgan";
import cors from "cors";

import { customerRouter } from "./routes/customerRouter.js";
import {initDatabase} from "./models/Database.js"

import 'dotenv/config.js'; 

const app = express(); // creates an express application
const PORT = process.env.PORT  || 3002;

initDatabase();

// Register the morgan logging middleware, use the 'dev' format
app.use(morgan('dev'));

app.use(cors()); 

// Parse incoming requests with a JSON payload
app.use(express.json());

//error handler
app.use( (err, req, res, next) => {
    console.log(err.stack);
    res.status(err.status || 500).json({
        code: err.status || 500,
        description: err.message || "An error occurred"
    });
});

app.use(customerRouter);


app.listen(PORT);
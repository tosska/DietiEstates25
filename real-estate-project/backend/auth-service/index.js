import express from "express";
import morgan from "morgan";
import cors from "cors";
import { authenticationRouter } from "./routes/authenticationRouter.js";

const app = express(); // creates an express application
const PORT = 3001;

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

app.use(authenticationRouter);

app.listen(PORT);
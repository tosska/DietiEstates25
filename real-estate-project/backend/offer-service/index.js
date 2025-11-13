
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { offerRouter } from "./routes/offerRouter.js";

const app = express(); // creates an express application
const PORT = 3004;

app.use(cors()); 

app.use(morgan('dev'));

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

app.use(offerRouter);

app.listen(PORT);










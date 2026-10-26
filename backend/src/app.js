import express from "express";
import userRouter from "./routes/user.routes.js";

const app = express(); // creating the express app
app.use(express.json());

// app.js receives all the routes 
// example route: http://localhost:4000/api/v1/users/register
app.use("/api/v1/users", userRouter);

export default app;

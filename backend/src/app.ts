import express from "express";
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express(); // creating the express app
app.use(express.json());

// app.ts receives all the routes
// example route: http://localhost:4000/api/v1/users/register
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);

// These two must stay at the bottom. Express runs middleware from top to bottom.
// notFound is only reached if none of the routes above matched the request.
app.use(notFound);
// errorHandler catches anything thrown by the routes and controllers above.
app.use(errorHandler);

export default app;

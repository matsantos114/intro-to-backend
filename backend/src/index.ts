import dotenv from "dotenv";
import connectDB from "./config/database.js";
import app from "./app.js";

dotenv.config({
    path: './.env'
});

const port = Number(process.env.PORT) || 8000;

const startServer = async () => {
    try {
        await connectDB();
        // Express 5 calls this on listen errors too (e.g. port in use), passing the error
        app.listen(port, (error?: Error) => {
            if (error) {
                console.log("Server error", error);
                process.exit(1);
            }
            console.log(`Server is running on ${port}`);
        });
    } catch (error) {
        console.log("Startup failed", error);
        process.exit(1);
    }
};

startServer();

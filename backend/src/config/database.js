import mongoose from "mongoose";
import dotenv from "dotenv";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
        {`${process.env.MONGODB_URI}`}
        console.log(`\n MongoDB Connected !!!
            ${connectionInstance.connection.host}
            `);

    } catch (error) {
        console.log("Mongo DB Connection Failed", error);
        process.exit(1);
    }

}

export default connectDB;
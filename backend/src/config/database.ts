import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set");
  }
  const connectionInstance = await mongoose.connect(mongoUri);
  console.log(`\n MongoDB Connected !!!
            ${connectionInstance.connection.host}
            `);
};

export default connectDB;

import mongoose, { Schema } from "mongoose";

interface IPost {
    name: string;
    description: string;
    age: number;
}

const postSchema = new Schema<IPost>(
    {
        name:{
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        age: {
            type: Number,
            required: true,
            min: 1,
            max: 150
        }
    },
    {
        timestamps: true
    }
)

export const Post = mongoose.model<IPost>('post', postSchema);
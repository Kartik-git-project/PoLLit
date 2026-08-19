import mongoose from "mongoose";
 

export const connectDB = async() => {
    console.log("MONGO_URI is:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI) 
        .then(() => {
            console.log("DB Connected!");
        })
}
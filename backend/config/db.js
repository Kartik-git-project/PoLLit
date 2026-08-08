import mongoose from "mongoose";


export const connectDB = async() => {
    await mongoose.connect("mongodb+srv://sonikarthik0301_db_user:Z0IaetcVpyfEzI5T@cluster0.mr8red2.mongodb.net/Poll") 
        .then(() => {
            console.log("DB Connected!");
        })
}
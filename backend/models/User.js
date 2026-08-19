import mongoose from "mongoose";
import bcrypt from 'bcryptjs'; 

const userSchema = new mongoose.Schema({
    name : {
        type: String, 
        required: true,
        trim: true
    },
    email: {
        type : String, 
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    username : {
        type : String, 
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type : String, 
        required: true,
        minlength: 8
    },
    avatar: {
        type: String, 
        default : "" 
    },
    bio : {
        type : String, 
        default : "",
        maxLength : 150
    },
    bookmarks: [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Poll"
    }],
    following: [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }],
    isVerified : {
        type : Boolean, 
        default : false
    },
    otp : String,
    otpExpires : Date
},{
    timestamps: true 
});

// to hash passowrd before saving it
userSchema.pre("save", async function (){
    if(!this.isModified("password")) return ;
    this.password = await bcrypt.hash(this.password, 10);
})

// to compare the user password with the save password
userSchema.methods.matchPassword = function (plain){
    return bcrypt.compare(plain, this.password);
};
export default mongoose.model("User", userSchema); 
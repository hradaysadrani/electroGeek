import mongoose from "mongoose";
import validator from 'validator';

interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    photo: string;
    role: "admin" | "user";
    gender?: "male" | "female";
    dob?: Date;
    createdAt: Date;
    updatedAt: Date;
    // Virtual Attribute
    age: number;
}

const schema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: [true, "Please enter a valid ID"],
        },
        name: {
            type: String,
            required: [true, "Please enter a valid name"],
        },
        email: {
            type: String,
            unique: [true, "Email already exist"],
            required: [true, "Enter valid email"],
            validate: validator.default.isEmail,
        },
        photo: {
            type: String,
            required: [true, "Please attach an valid product photo"],
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
        },
        gender: {
            type: String,
            enum: ["male", "female"],
            required: false,
        },
        dob: {
            type: Date,
            required: false,
        },
    },
    {
        timestamps: true,   
    }
);

schema.virtual("age").get(function () {
    if (!this.dob) return null;
    
    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();

    if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
});

export const User = mongoose.model<IUser>("User", schema);
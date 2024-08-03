import mongoose from "mongoose";


const schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter a valid name"],
        },
        photo: {
            type: String,
            required: [true, "Please upload a valid photo"],
        },
        price: {
            type: Number,
            required: [true, "Please enter a valid price"],
        },
        stock: {
            type: Number,
            required: [true, "Please enter quantity of stock"],
        },
        category: {
            type: String,
            required: [true, "Please enter a valid category name"],
            trim: true, // this will remove whitespaces
        },
        
    },
    {
        timestamps: true,   
    }
);

export const Product = mongoose.model("Product", schema);
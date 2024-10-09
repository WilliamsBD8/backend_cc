import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    value:{
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        trim: true
    },
    cost:{
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        trim: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: Boolean,
        default: true
    },
},{
    timestamps: true
})

const Product = mongoose.model("Products", productSchema);
export default Product
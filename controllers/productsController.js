import Product from "../models/Product.js";
import { errorsDB } from "../helpers/errorsDB.js";

import { messageError, messageSuccess } from "../helpers/responds.js";

const getProducts = async(req, res) => {
    const data = req.query;

    const draw = parseInt(req.query.draw) || 1; // Número de dibujo de DataTables
    const length = parseInt(req.query.length) || 10; // Número de registros por página
    const start = parseInt(req.query.start) || 0; // Índice de inicio

    const dataTable = {
        draw: draw || 1,
        length: length,
        start: start,
        page: data.page || Math.ceil((start - 1) / length + 1)
    };

    try {
        const products = await Product.find()
            .sort({ createdAt: -1 })
            .skip(start) // Salta los primeros 'start' registros
            .limit(length); // Limita la cantidad de registros
        const total = await Product.countDocuments();
        // return messageSuccess(res, products, 200)
        return messageSuccess(res, {
            draw,
            recordsTotal: total,
            recordsFiltered: total,
            data: products
        }, 200)
    } catch (error) {
        if("errorResponse" in error){
            var myError = errorsDB().find(e => e.code == error.errorResponse.code);
            const error_key = Object.keys(error.errorResponse.keyPattern);
            let repeat = error.errorResponse.keyValue[error_key[0]];
            myError.msg = myError.msg.replace('%campo%', repeat);
        }else{
            var myError = {msg: error}
        }
        return messageError(res, myError.msg, 404);
    }
}

const created = async (req, res) => {
    try{
        const product = new Product(req.body);
        await product.save();
        messageSuccess(res, {msg: 'Producto Creado'}, 200)
    }catch (error) {
        if("errorResponse" in error){
            var myError = errorsDB().find(e => e.code == error.errorResponse.code);
            const error_key = Object.keys(error.errorResponse.keyPattern);
            let repeat = error.errorResponse.keyValue[error_key[0]];
            myError.msg = myError.msg.replace('%campo%', repeat);
        }else{
            var myError = {msg: error}
        }
        return messageError(res, myError.msg, 404);
    }
}

const updated = async (req, res) => {
    try{
        const {_id, name, description, cost, value, status} = req.body;
        const product = await Product.findOne({_id});
        product.name = name
        product.description = description
        product.cost = cost
        product.value = value
        product.status = status
        await product.save();
        messageSuccess(res, product, 200)
    }catch (error) {
        if("errorResponse" in error){
            var myError = errorsDB().find(e => e.code == error.errorResponse.code);
            const error_key = Object.keys(error.errorResponse.keyPattern);
            let repeat = error.errorResponse.keyValue[error_key[0]];
            myError.msg = myError.msg.replace('%campo%', repeat);
        }else{
            var myError = {msg: error}
        }
        return messageError(res, myError.msg, 404);
    }
}

const getAll = async (req, res) => {
    try {
        const {type} = req.body;
        if(type == 1){
            const products = await Product.find();
            return messageSuccess(res, {
                data: products
            }, 200)
        }else if(type == 2){
            const products = await Product.find();
            return messageSuccess(res, {
                data: products
            }, 200)
        }else{
            return messageSuccess(res, {
                data: []
            }, 200)
        }
    } catch (error) {
        if("errorResponse" in error){
            var myError = errorsDB().find(e => e.code == error.errorResponse.code);
            const error_key = Object.keys(error.errorResponse.keyPattern);
            let repeat = error.errorResponse.keyValue[error_key[0]];
            myError.msg = myError.msg.replace('%campo%', repeat);
        }else{
            var myError = {msg: error}
        }
        return messageError(res, myError.msg, 404);
    }
}

export {getProducts, created, updated, getAll }
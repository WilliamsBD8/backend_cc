import Invoice from "../models/Invoices.js";
import LinesInvoice from "../models/LineInvoice.js";
import Product from "../models/Product.js";
import { errorsDB } from "../helpers/errorsDB.js";

import { messageError, messageSuccess } from "../helpers/responds.js";

import mongoose from 'mongoose';

const getInvoices = async (req, res) => {
    try {

        const data = req.query;

        const draw = parseInt(req.query.draw) || 1; // Número de dibujo de DataTables
        const length = parseInt(req.query.length) || 10; // Número de registros por página
        const start = parseInt(req.query.start) || 0; // Índice de inicio

        // Obtener todas las facturas
        const invoices = await Invoice.find()
            .populate('user_id', 'name')
            .sort({ createdAt: -1 })
            .skip(start) // Salta los primeros 'start' registros
            .limit(length);  // Rellenar los datos del usuario

        // Obtener las líneas de factura para cada factura
        // const invoicesWithLines = await Promise.all(invoices.map(async (invoice) => {
        //     const lines = await LinesInvoice.find({ invoice_id: invoice._id })
        //         .populate('product_id', 'name price');  // Rellenar los datos del producto

        //     return { ...invoice.toObject(), lines };  // Combinar la factura con sus líneas
        // }));

        const total = await Invoice.countDocuments();
        // return messageSuccess(res, products, 200)
        return messageSuccess(res, {
            draw,
            recordsTotal: total,
            recordsFiltered: total,
            data: invoices
        }, 200)

        return messageSuccess(res, {
            invoices: invoices
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

const getInvoice = async (req, res) => {
    try {
        const { _id } = req.params;
        const invoice = await Invoice.findOne({_id})
        .populate('user_id', 'name');
        if(!invoice){
            return messageError(res, "La factura no existe", 403);
        }
        // Obtener las líneas de factura para cada factura
        // Paso 2: Obtener las líneas de factura asociadas
        const lines = await LinesInvoice.find({ invoice_id: invoice._id })
        .populate('product_id', 'name description stock');  // Rellenar los datos del producto

        // Paso 3: Combinar la factura con sus líneas
        const invoiceWithLines = {
        ...invoice.toObject(),  // Convertir la factura a objeto plano
        lines  // Agregar las líneas de factura
        };
        return messageSuccess(res, {
            invoice: invoiceWithLines
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

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const data = req.body;

        const newInvoice = new Invoice({
            user_id: data.user_id,
            type_invoice: data.type,
            value: data.value,
            status: "Pagado"
        });

        const savedInvoice = await newInvoice.save({ session });

        await Promise.all(data.products.map(async item => {
            const line = {
                product_id: item._id,
                invoice_id: savedInvoice._id,
                quantity: item.quantity,
                value: item.value,
                cost: item.cost
            };

            // Guardar cada línea de factura
            const newLine = await LinesInvoice.create([line], { session });

            // Actualizar el producto asociado, por ejemplo, restar del stock
            await Product.updateOne(
                { _id: item._id },
                { 
                    $set: {
                        cost: item.cost, 
                        value: item.value
                    },
                    $inc : {
                        stock: data.type == 1 ? item.quantity : (data.type == 2 ? (-1 * item.quantity) : 0)
                    }
                },
                { session }
            );

            return newLine;
        }));

        // Si todo está bien, hacer commit de la transacción
        await session.commitTransaction();
        session.endSession();

        return messageSuccess(res, {
            msg: "Factura generada con exito",
            data
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

const updated = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {invoice_id, details} = req.body;

        const invoice = await Invoice.findOne({_id: invoice_id}).session(session);
        if(!invoice){
            return messageError(res, "La factura no existe", 403);
        }

        let value = 0;

        await Promise.all( details.map(async (p) => {
            let new_stock = 0;
            p.quantity_edit = parseInt(p.quantity_edit);
            p.cost = parseFloat(p.cost);
            p.value = parseFloat(p.value);
            
            if(p.invoice){
                if(!p.isDelete){
                    let quantity_diff = parseInt(p.quantity) - parseInt(p.quantity_edit);
                    if(invoice.type_invoice == 1){
                        new_stock = -1 * quantity_diff,
                        value += p.value * p.quantity_edit
                    }
                    else if(invoice.type_invoice == 2){
                        new_stock = quantity_diff;
                        value += p.cost * p.quantity_edit;
                    }
                    await LinesInvoice.updateOne(
                        {_id: p._id},
                        {
                            $set: {
                                quantity: parseInt(p.quantity_edit),
                                value: parseFloat(p.value),
                                cost: parseFloat(p.cost)
                            }
                        },
                        { session }
                    );
                    
                }else{
                    await LinesInvoice.deleteOne(
                        { _id: p._id },
                        { session }
                    );
                }

            }else{
                const line = {
                    product_id: p.product_id,
                    invoice_id: invoice._id,
                    quantity: p.quantity_edit,
                    value: p.value,
                    cost: p.cost
                };
                await LinesInvoice.create([line], { session });

                if(invoice.type_invoice == 1){
                    new_stock = p.quantity_edit;
                    value += p.value * p.quantity_edit;
                }else if(invoice.type_invoice == 2){
                    new_stock = -1 * p.quantity_edit
                    value += p.cost * p.quantity_edit;
                }
            }
            await Product.updateOne(
                { _id: p.product_id },
                { 
                    $set: {
                        cost: parseFloat(p.cost), 
                        value: parseFloat(p.value)
                    },
                    $inc : {
                        stock: new_stock
                    }
                },
                { session }
            );
        }));

        await Invoice.updateOne(
            { _id: invoice_id },
            { 
                $set: {
                    value,
                }
            },
            { session }
        );

        await session.commitTransaction();

        return messageSuccess(res, {msg: "Factura editada con exito"}, 200)
        
    } catch (error) {
        console.log(error);
        await session.abortTransaction();
        if("errorResponse" in error){
            var myError = errorsDB().find(e => e.code == error.errorResponse.code);
            if(myError){
                const error_key = Object.keys(error.errorResponse.keyPattern);
                let repeat = error.errorResponse.keyValue[error_key[0]];
                myError.msg = myError.msg.replace('%campo%', repeat);
            }else{
                var myError = {msg: error}
            }
        }else{
            var myError = {msg: error}
        }
        return messageError(res, myError.msg, 404);
    } finally {
        session.endSession(); // Finalizar la sesión en el bloque finally
    }
}

export {getInvoices, getInvoice, created, updated }
import mongoose from "mongoose";

const lineInvoiceSchema = mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',  // Referencia al esquema de productos
        required: false
    },
    invoice_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoices',  // Referencia al esquema de facturas
        required: false
    },
    quantity: {
        type: Number,
        required: true
    },
    value: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
    },
    cost: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
    }
},{
    timestamps: true
});

const LinesInvoice = mongoose.model('LinesInvoice', lineInvoiceSchema);

export default LinesInvoice;
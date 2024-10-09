import mongoose from "mongoose";

const invoiceSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',  // Referencia al esquema de usuarios
        required: false
    },
    type_invoice: {
        type: Number,
        required: false
    },
    value: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
    },
    status: {
        type: String,
        enum: ['Pagado', 'Pendiente', 'Rechazado'],
        default: 'Pendiente'
    }
},
{
    timestamps: true
});

const Invoice = mongoose.model('Invoices', invoiceSchema);

export default Invoice;
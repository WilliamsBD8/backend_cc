import mongoose from "mongoose";

const conectarDB = async () => {
    try {
        console.log('connection');
        const connection = await mongoose.connect(`${process.env.MONGO_URI}computer_class_backend`, {});
        const url = `${connection.connection.host}:${connection.Connection.port} `;
        console.log(`MongoDB conectado en: ${url}`);
    } catch (error) {
        console.log(`error: ${error.message}`);
        process.exit(1);
    }
}
export default conectarDB
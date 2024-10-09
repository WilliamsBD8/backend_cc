import User from "../models/Users.js";
import { generateId } from "../helpers/generateId.js";
import { errorsDB } from "../helpers/errorsDB.js";
import bcrypt from 'bcrypt';

import { messageError, messageSuccess } from "../helpers/responds.js";

const register = async (req, res) => {

    try{
        const user = new User(req.body);
        user.token = generateId();
        const SaveUser = await user.save();
        messageSuccess(res, SaveUser, 200)
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

const authenticate = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email})
    if(!user){
        return messageError(res, "El usuario no existe", 403);
    }

    if(!user.confirm){
        return messageError(res, "Tu cuenta no ha sido confirmada", 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch)
        return messageError(res, "Las credenciales no concuerdan.", 403);

    return messageSuccess(res, user, 200)
}

const confirm = async (req, res) => {
    const { token } = req.params;
    const userConfirm = await User.findOne({token});
    if(!userConfirm)
        return messageError(res, "Token no valido", 402);
    try {
        userConfirm.confirm = true;
        userConfirm.token = "";
        await userConfirm.save();
        
        return messageError(res, "Usuario confirmado", 200);
    } catch (error) {
        
        return messageError(res,  error, 404);
    }
}

export {register, authenticate, confirm};
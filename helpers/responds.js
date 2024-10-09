export function messageError(res, msg, status = 404){
    const error = new Error(msg);
    return res.status(status).json({msg: error.message})
}

export function messageSuccess(res, response, status){
    
    return res.status(status).json(response)
}
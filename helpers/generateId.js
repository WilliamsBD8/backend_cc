const generateId = () =>  {
    const ramdon = Math.random().toString(32).substring(2);
    const date = Date.now().toString(32);
    return `${ramdon}${date}`
}

export {generateId}
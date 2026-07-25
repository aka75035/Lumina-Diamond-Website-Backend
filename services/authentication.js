const JWT = require("jsonwebtoken");

function createTokenForUser(user){
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not set in environment');
    }

    const payload = {
    _id: user._id,
    role: user.role,
};

    const token = JWT.sign(payload, secret);

    return token;

}

function validateToken(token){
    const secret = process.env.JWT_SECRET;
    if (!secret) { 
        throw new Error('JWT_SECRET is not set in environment');
    }
    const payload = JWT.verify(token, secret);
    return payload;
}

module.exports ={
    createTokenForUser,
    validateToken,
}
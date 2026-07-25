const { randomBytes, createHmac} = require('crypto');
const { Schema, model } = require('mongoose');
const { createTokenForUser } = require('../services/authentication');

const usersSchema = new Schema(
    {
      firstName:{type: String},
      lastName:{type: String},
      mobile:{type: String},
      address:{type: String},
      company:{type: String},
      country:{type: String},
      city:{type: String},
      state:{type: String},
      pinCode:{type: String},
      userName: { type: String, required: true },
      password: { type: String, required: true },
      email: { type: String, required: true },
      salt: { type: String },
      role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    },{
    timestamps: true
});


usersSchema.pre("save", function () {
    const user = this;

    if (!user.isModified("password")) {
        return;
    }

    const salt = randomBytes(16).toString();

    const hashedPassword = createHmac("sha256", salt)
        .update(user.password)
        .digest("hex");

    this.salt = salt;
    this.password = hashedPassword;
});

usersSchema.static("matchPasswordAndGenerateToken", async function(email, password){

    const user = await this.findOne({ email });


    if(!user) throw new Error('User Not Found');

    const salt = user.salt;
    const hashedPassword = user.password;
    const role = user.role;

    const userProvidedHash = createHmac("sha256", salt).update(password).digest("hex");

    
    if(hashedPassword !== userProvidedHash) throw new Error('Incorrect Password');
    
    const  token = createTokenForUser(user);
    return {token, role};
})

const Users = model('Users', usersSchema);

module.exports = Users;

const {v4: uuidv4} = require('uuid');
const Users = require('../models/users');

async function handleSignUp(req, res){
    try {
        const {userName, password, email, role} = req.body;
        await Users.create({
            userName,
            password,
            email,
            role,
        });
        return res.json("SingUp Success");
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
};

async function handleLogin(req, res){
    try{
        const {email, password} = req.body;
        
        const {token, role} = await Users.matchPasswordAndGenerateToken(email, password);
        if(role === 'ADMIN'){
            return res.cookie('token', token,).redirect("/");
        }
        else{
            return res.cookie('token', token,{
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
            }).json({success: true, role: "USER"});
            ;
        }

    }
    catch (error) {
        console.log(error)
        return res.render("login", {
            error: "Incorrect Email or Password"
        })
    }

};


async function handleDetailChange(req, res) {
    try {
        const {
            email,
            firstName,
            lastName,
            mobile,
            address,
            company,
            country,
            city,
            state,
            pinCode,
        } = req.body;

        const updatedUser = await Users.findByIdAndUpdate(
            req.user._id,
            {
                firstName,
                lastName,
                mobile,
                address,
                company,
                country,
                city,
                state,
                pinCode,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
}

module.exports = {
    handleSignUp,
    handleLogin,
    handleDetailChange,
}
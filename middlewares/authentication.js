const Users = require("../models/users");
const {
    validateToken
} = require("../services/authentication");


// ==============================
// CHECK AUTH COOKIE
// ==============================

function checkForAuthenticationCookie(cookieName) {

    return async (req, res, next) => {

        const tokenCookieValue =
            req.cookies[cookieName];

        if (!tokenCookieValue) {

            return next();

        }

        try {

            const userPayload = validateToken(tokenCookieValue);

            const user = await Users.findById(userPayload._id);

            req.user = user;

        } catch (error) {
          

            console.log("Invalid Token");

        }

        next();

    };

}


// ==============================
// LOGGED-IN USER ONLY
// ==============================

function restrictToLoggedinUserOnly(
    req,
    res,
    next
) {
    

    if (!req.user) {

        return res.redirect("/login");

    }

    next();

}


// ==============================
// ADMIN ONLY
// ==============================

function restrictToAdminOnly(
    req,
    res,
    next
) {

    if (!req.user) {

        return res.redirect("/login");

    }

    if (req.user.role !== "ADMIN") {

        return res.status(403).send("Access Denied");

    }

    next();

}

function restrictToUserOnly(
    req,
    res,
    next
) {

    if (!req.user) {

        return res.redirect("/login");

    }

    if (req.user.role !== "USER") {

        return res.status(403).send("Access Denied");

    }

    next();

}


module.exports = {

    checkForAuthenticationCookie,

    restrictToLoggedinUserOnly,

    restrictToAdminOnly,
    restrictToUserOnly,

};
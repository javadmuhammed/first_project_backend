
let jwt = require("jsonwebtoken");

let authMiddleWare = {
    isValidUser: (req, res, next) => {
        if ((req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') && (req.headers.refresh_reference)) {
            let access_token = req.headers.authorization.split(' ')[1];
            let refresh_reference = req.headers.refresh_reference;

            try {
                jwt.verify(access_token, process.env.JWT_SECRET, (err, data) => {
                    if (err) { 
                        console.log(access_token)
                        res.status(403).send({ status: false, error: true, msg: "Unauthorized Access" })
                    } else {
                        req.body.userid = refresh_reference;
                        next();
                    }
                })
            } catch (e) {
                res.status(403).send({ status: false, error: true, msg: "Unauthorized Access" })
            }
        } else {
            res.status(403).send({ status: false, error: true, msg: "Unauthorized Access" })
        }
    },


    checkUserHas: (req, res, next) => {
        if ((req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') && (req.headers.refresh_reference)) {
            let access_token = req.headers.authorization.split(' ')[1];
            let refresh_reference = req.headers.refresh_reference;

            try {
                jwt.verify(access_token, process.env.JWT_SECRET, (err, data) => {
                    if (!err) {  
                        req.body.userid = refresh_reference;
                        next();
                    }else{
                        next();
                    }
                })
            } catch (e) {
                next();
            }
        } else {
            next();
        }
    },



    isValidAdmin: (req, res, next) => {
        if ((req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') && (req.headers.refresh_reference)) {
            let access_token = req.headers.authorization.split(' ')[1];
            let refresh_reference = req.headers.refresh_reference;
 
            console.log(access_token,refresh_reference)

            try {
                jwt.verify(access_token, process.env.JWT_SECRET, (err, data) => {
                    if (err) {
                        res.status(403).send({ status: false, error: true, msg: "Unauthorized Access 1" })
                    } else {
                        req.body.admin_id = refresh_reference;
                        next();
                    }
                })
            } catch (e) {
                res.status(403).send({ status: false, error: true, msg: "Unauthorized Access 2" })
            }
        } else {
            res.status(403).send({ status: false, error: true, msg: "Unauthorized Access 3" })
        }
    }
}


module.exports = authMiddleWare;
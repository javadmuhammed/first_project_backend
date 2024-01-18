
let jwt = require("jsonwebtoken");

let authMiddleWare = {
    isValidUser: (req, res, next) => {
        console.log(req.headers)

        if ((req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') && (req.headers.reference)) {
            let access_token = req.headers.authorization.split(' ')[1];
            let reference = req.headers.reference;

            try {
                jwt.verify(access_token, process.env.JWT_SECRET, (err, data) => {
                    if (err) { 
                        console.log(access_token)
                        console.log("ERR1")
                        res.status(403).send({ status: false, error: true, msg: "Unauthorized Access" })
                    } else {
                        req.body.userid = reference;
                        next();
                    }
                })
            } catch (e) {
                console.log("ERR2")
                res.status(403).send({ status: false, error: true, msg: "Unauthorized Access" })
            }
        } else {
            console.log("ERR3")
            res.status(403).send({ status: false, error: true, msg: "Unauthorized Access" })
        }
    },


    checkUserHas: (req, res, next) => {
        if ((req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') && (req.headers.reference)) {
            let access_token = req.headers.authorization.split(' ')[1];
            let reference = req.headers.reference;

            try {
                jwt.verify(access_token, process.env.JWT_SECRET, (err, data) => {
                    if (!err) {  
                        req.body.userid = reference;
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
        
        console.log("all over req header", req.headers)
        console.log("Auth Token",req.headers.authorization)  
        console.log("Reference Token", req.headers.reference)

        if ((req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') && (req.headers.reference)) {
            let access_token = req.headers.authorization.split(' ')[1];
            let reference = req.headers.reference;
 
            console.log("Creditials is " + access_token + " " + reference)

            try {
                jwt.verify(access_token, process.env.JWT_SECRET, (err, data) => {
                    if (err) {
                        console.log("Unauthorized Access 1", err)
                        res.status(403).send({ status: false, error: true, msg: "Unauthorized Access 1" })
                    } else {
                        req.body.admin_id = reference;
                        next();
                    }
                })
            } catch (e) {
                console.log("Unauthorized Access 2")
                res.status(403).send({ status: false, error: true, msg: "Unauthorized Access 2" })
            }
        } else {
            console.log("Unauthorized Access 1- here")
            res.status(403).send({ status: false, error: true, msg: "Unauthorized Access 3" })
        }
    }
}


module.exports = authMiddleWare;
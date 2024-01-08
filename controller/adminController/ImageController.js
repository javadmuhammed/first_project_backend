 
const adminHelper = require("../../helper/AdminHelper/AdminHelper"); 

let imageController = {
    uploadImage: (req, res) => {
        console.log(req.body)
        console.log(req.files)
        let image = req.files.image;
        let fileSize = req.body.file_size;

        adminHelper.uploadImage(image, fileSize).then((data) => {
            res.send({ status: true, error: false, msg: "Image Upload Success" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Image Upload Failed" })
        })
    },


    delete_image: async (req, res) => {

        let image_id = req.body.image_id;
        console.log(req.body)
        try {
            await adminHelper.deleteImages(image_id);
            res.send({ status: true, error: false, msg: "Image Delete Success" })
        } catch (error) {
            res.send({ status: false, error: true, msg: "Image Delete Failed" })
        }
    },



    getAllImages: (req, res) => {
        adminHelper.getAllWebImages().then((data) => {
            res.send({ status: true, data })
        }).catch((err) => {
            res.send({ status: error, msg: "Image fetching failed" })
        })
    },
}

module.exports = imageController;
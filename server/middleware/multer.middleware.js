const multer = require('multer')

// File upload middleware
const defStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/images/uploads')
    },
    filename: function(req, file, cb) {
        cb(null, req.session.user.user_id + '-' + Date.now() + '-' + file.originalname)
    }
})

const upload = multer({storage: defStorage}).single('file')

module.exports = { upload }
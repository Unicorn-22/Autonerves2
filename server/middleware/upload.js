const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = './uploads/vehicles/';

// Ensure the upload directory exists
fs.mkdirSync(uploadDir, { recursive: true });

// Set storage engine
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: function(req, file, cb){
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).array('images', 5); // 'images' is the field name, allow up to 5 files

// Check file type
function checkFileType(file, cb){
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

module.exports = upload;

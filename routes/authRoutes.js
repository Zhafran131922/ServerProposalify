const express = require("express");
const authAdmin = require("../middleware/authAdmin");
const router = express.Router();
const authController = require("../controllers/authController");


const { registerUser } = require('../controllers/authController'); 
const { registerAdmin } = require('../controllers/authController');
const { loginAdmin } = require('../controllers/authController');
const { loginUser } = require('../controllers/authController');
const { loginDosen } = require('../controllers/authController');
const { login } = require('../controllers/authController');
const { register } = require('../controllers/authController');


router.post ("/admin/register-dosen", authAdmin, authController.registerDosen);
router.post ('/register/user', registerUser);
router.post ("/register/admin", registerAdmin) ;
router.post ('/login/admin', loginAdmin);
router.post ('/login/user', loginUser);
router.post ('/login/dosen', loginDosen);
router.post ('/login', login);
router.post ('/register', register);

module.exports = router;

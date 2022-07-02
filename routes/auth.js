// Route for user authentication and user profile
const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const secret = process.env.JWT_SECRET;

const User = require("../models/User");
const fetchUser = require("../middleware/fetchUser");

// ROUTE-1: Register a user using: POST "/api/auth/register". Doesn't Require Login
router.post("/register",[
    body("name", "Name should be minimum 5 characters!").isLength({min: 5}),
    body("email", "Enter a valid email!").isEmail(),
    body("phone", "Phone number must be of 10 characters!").isLength({min: 10, max: 10}),
    body("password", "Password must contain atleast 1 uppercase, 1 lowercase, 1 special character, and 1 number!")
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/)
], async (req, res)=> {
    let success;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      success = false;
      return res.status(400).json({ success, errors: errors.array()[0].msg });
    }

    const {name, email, phone, password} = req.body;

    try {
        const emailUser = await User.findOne({email: email});
        if(emailUser) {
            success = false;
            return res.status(400).json({success, error: "Email already in use!"});
        }

        const phoneUser = await User.findOne({phone: phone});
        if(phoneUser) {
            success = false;
            return res.status(400).json({success, error: "Phone already in use!"});
        }

        const salt = await bcrypt.genSalt(10);
        const securePassword = await bcrypt.hash(password, salt);

        let user = await User.create({
            name: name,
            email: email,
            phone: phone,
            password: securePassword
        });

        const data = {
            user: {
              id: user.id,
            }
        };

        const authToken = jwt.sign(data, secret);
        success = true;
        return res.status(200).json({ success, authToken });
    } catch (error) {
        success = false;
        return res.status(500).json({success, error: error.message});
    }
});

// ROUTE-2: Login a user using: POST "/api/auth/login". Doesn't Require Login
router.post("/login",[
      body("email", "Enter a valid email").isEmail(),
      body("password", "Password cannot be empty").exists(),
    ], async (req, res) => {
        let success;
        const errors = validationResult(req.body);
        if (!errors.isEmpty()) {
            success = false;
            return res.status(400).json({ success, error: errors.array()[0].msg });
        }
  
        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (!user) {
                success = false;
                return res.status(400).json({success, error: "No account is associated to this email"});
            }
            const passwordCompare = await bcrypt.compare(password, user.password);
            if (!passwordCompare) {
                success = false;
                return res.status(400).json({success, error: "Incorrect Password"});
            }
            const data = {
                user: {
                    id: user.id,
                },
            };

            const authToken = jwt.sign(data, secret);
            success = true;
            return res.status(200).json({ success, authToken });
        } catch (error) {
            success = false;
            return res.status(500).json({ success, error: error.message });
        }
});

// ROUTE-3: Get logged-in user details using: GET "/api/auth/profile". Require Login
router.get("/profile", fetchUser, async (req, res) => {
    let success;
    try {
      const userId = req.user.id;
      const profile = await User.findById(userId)
        .select("-password");
  
      success = true;
      return res.status(200).json({ success, profile });
    } catch (err) {
      success = false;
      return res.status(500).json({ success, error: err.message });
    }
});

// ROUTE-4: Edit user details using: PUT "/api/auth/editprofile". Require Login
router.put("/editprofile", fetchUser,[
        body("name", "Name should be minimum 5 characters!").isLength({ min: 5 }),
        body("email", "Enter a valid email!").isEmail(),
        body("phone", "Enter a valid phone!").isLength({min: 10, max: 10}),
    ], async (req, res) => {
        let success;
        const userId = req.user.id;
        const { name, phone, email } = req.body;
  
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            success = false;
            return res.status(400).json({ success, error: errors.array()[0].msg });
        }
  
        try {
            let profile = await User.findById(userId);
            if (!profile) {
                success = false;
                return res.status(400).json({ success, error: "User not found!" });
            }
  
            let updateduser = {
                name: name,
                email: email,
                phone: phone
            };
  
            let emailUser = null;
            let phoneUSer = null;
  
            if (email !== profile.email) {
                emailUser = await User.findOne({ email: updateduser.email });
            }
  
            if (phone !== profile.phone) {
                phoneUSer = await User.findOne({ phone: updateduser.phone });
            }
  
            if (emailUser) {
                success = false;
                return res.status(400).json({ success, error: "This email is already taken!"});
            }
  
            if (phoneUSer) {
                success = false;
                return res.json({ success, error: "This phone is already taken!"});
            }
  
            profile = await User.findByIdAndUpdate(userId, {name: updateduser.name, email: updateduser.email, phone: updateduser.phone},{ new: true })
                .select("-password");
            success = true;
            return res.status(200).json({ success, profile });
        } 
        catch (error) {
            success = false;
            return res.status(500).json({ success, error: error.message });
        }
});

module.exports = router;
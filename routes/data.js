// Route for user data
const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();

const Data = require("../models/Data");
const User = require("../models/User");
const fetchUser = require("../middleware/fetchUser");

// ROUTE-1: Get all user data using: GET "/api/data/". Require Login
router.get("/", fetchUser, async (req, res)=> {
    const userId = req.user.id;
    let success;
    try {
        const user = await User.findById(userId);
        if(!user) {
            success = false;
            return res.status(404).json({ success, error: "User not found!" });
        }

        const allData = await Data.find({user: userId}).limit(5);

        success = true;
        return res.status(200).json({success, allData});
    } catch (error) {
        success = false;
        return res.status(500).json({success, error: error.message});
    }
});

// ROUTE-2: Add user data using: POST "/api/data/add-data". Require Login
router.post("/add-data", fetchUser,[
    body("name", "Name should be minimum 3 characters!").isLength({ min: 3 }),
    body("email", "Enter a valid email!").isEmail(),
    body("phone", "Enter a valid phone!").isLength({min: 10, max: 10}),
    body("domain", "Domain cannot be empty!").exists()
], async (req, res) => {
    let success;
    const userId = req.user.id;
    const { name, phone, email, domain } = req.body;

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

        let newData = await Data.create({
            name: name,
            email: email,
            phone: phone,
            domain: domain,
            user: userId
        });

        profile = await User.findByIdAndUpdate(userId, {$push: {data: newData}}, { new: true });

        const allData = await Data.find({user: userId}).limit(5);

        success = true;
        return res.status(200).json({ success, profile, allData });
    } 
    catch (error) {
        success = false;
        return res.status(500).json({ success, error: error.message });
    }
});

// ROUTE-3: Edit user data using: PUT "/api/data/edit-data/:id". Require Login
router.put("/edit-data/:id", fetchUser,[
    body("name", "Name should be minimum 3 characters!").isLength({ min: 3 }),
    body("email", "Enter a valid email!").isEmail(),
    body("phone", "Enter a valid phone!").isLength({min: 10, max: 10}),
    body("domain", "Domain cannot be empty!").exists()
], async (req, res) => {
    let success;
    const userId = req.user.id;
    const dataId = req.params.id;
    const { name, phone, email, domain } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array()[0].msg });
    }

    try {
        let user = await User.findById(userId);
        if (!user) {
            success = false;
            return res.status(400).json({ success, error: "User not found!" });
        }

        let data = await Data.findById(dataId);
        if (!data) {
            success = false;
            return res.status(400).json({ success, error: "Data not found!" });
        }

        if(data.user.toString() !== userId) {
            success = false;
            return res.status(405).json({success, error: "Not allowed!"});
        }

        let updatedData = {
            name: name,
            email: email,
            phone: phone,
            domain: domain
        }

        data = await Data.findByIdAndUpdate(dataId, 
            {name: updatedData.name, email: updatedData.email, phone: updatedData.phone, domain: updatedData.domain},
            { new: true }
        );
        
        const allData = await Data.find({user: userId}).limit(5);
            
        success = true;
        return res.status(200).json({ success, allData });
    } 
    catch (error) {
        success = false;
        return res.status(500).json({ success, error: error.message });
    }
});

// ROUTE-4: Edit user data using: DELETE "/api/data/delete-data/:id". Require Login
router.delete("/delete-data/:id", fetchUser, async (req, res) => {
    let success;
    const userId = req.user.id;
    const dataId = req.params.id;

    try {
        let profile = await User.findById(userId);
        if (!profile) {
            success = false;
            return res.status(400).json({ success, error: "User not found!" });
        }

        let data = await Data.findById(dataId);
        if (!data) {
            success = false;
            return res.status(400).json({ success, error: "Data not found!" });
        }

        if(data.user.toString() !== userId) {
            success = false;
            return res.status(405).json({success, error: "Not allowed!"});
        }

        profile = await User.findByIdAndUpdate(userId, {$pull: {data: dataId}}, {new: true});
        data = await Data.findByIdAndDelete(dataId, { new: true });

        const allData = await Data.find({user: userId}).limit(5);

        success = true;
        return res.status(200).json({ success, profile, allData });
    } 
    catch (error) {
        success = false;
        return res.status(500).json({ success, error: error.message });
    }
});

module.exports = router;
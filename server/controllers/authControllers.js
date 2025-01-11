const Users = require("../models/userModel");
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const  register = async (req, res) => {
    try {
        console.log("Received registration request");
        const { user } = req.body;
        let pic=req.body.pic;
        const { fullName, email, password } = user;
        // console.log("pic received",pic,fullName,email,password);
        // console.log(req.body);
        console.log("pic received", pic);
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'Please fill all required details', status: 400 });
        } else {
            const isAlreadyExist = await Users.findOne({ email });

            if (isAlreadyExist) {
                return res.status(400).json({ message: 'User Alredy Exist', status: 400 });
            } else {
                const salt = await bcryptjs.genSalt(10);
                const hashedpassword = await bcryptjs.hash(password, salt);
                if(pic===null||pic===undefined) pic="https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
                const newUser = new Users({
                    fullName,
                    email,
                    password: hashedpassword,
                    pic: pic
                });

                await newUser.save();
                console.log("mbvdhmsbdfndm");
                return res.status(200).json({ message: 'User Registered Successfully', status: 200 });
                ;
            }
        }
    } catch (error) {
        console.log(error, "signup backend error");
        return res.status(500).json({ message: 'Internal Server Error', status: 500 });;
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Please fill all the required details', status: 400 });
        } else {
            const user = await Users.findOne({ email });
            if (!user) {
                res.status(400).json({ message: 'User Email or Password is Incorrect', status: 400 });
            }
            else {
                const validateUser = await bcryptjs.compare(password, user.password);
                if (!validateUser) {
                    res.status(400).json({ message: 'User Email or Password is Incorrect', status: 400 });
                }
                else {
                    const payload = {
                        userId: user._id,
                        email: user.email
                    }
                    const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "chatapp";
                    jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: 84600 }, async (err, token) => {
                        await Users.updateOne({ _id: user._id }, {
                            $set: { token }
                        })
                        user.save();
                        return res.status(200).json({ user: { id: user._id, email: user.email, fullName: user.fullName, imageUrl: user.pic }, token: token, message: "user signedin successfully", status: 200 });

                    })
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = { register, login };
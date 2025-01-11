const User = require("../models/userModel");

const getUser = async (req, res) => {
    const { userId } = req.body;
    // console.log("fghajskysgdklasfh",userId);
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
        ]
    } : {}
    const users = await User.find(keyword).find({ _id: { $ne: userId } });
    res.send(users);
    console.log(keyword);
}

const getUsers = async (req, res) => {
    try {
        const users = await Users.find();
        const usersData = Promise.all(users.map(async (user) => {
            return { user: { email: user.email, fullName: user.fullName }, userId: user._id };
        }))
        res.status(200).json(await usersData);
    } catch (error) {
        console.log(error);
    }
}

module.exports = { getUser, getUsers };
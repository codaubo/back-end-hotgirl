const express = require('express');
const userModel = require('./model');
const userRouter = express.Router();

userRouter.get('/:userId', async(req, res) => {
    try {
        const { userId }  = req.params;
        const userInfo = await userModel.findById(userId).exec();
        res.status(200).json(userInfo);
    } catch (error) {
        res.status(error.status || 500 ).end(error.message || 'Internal server error');
    }
});
// ham asyn vi ghi vao csdl thi bat dong bo
userRouter.post('/test', async (req, res) => {
    try {
        // check username
        const existUsername = await userModel.findOne({
            username: req.body.username
        }).exec();
        if(existUsername) {
            res.status(403).end("Username has been used");
        }
        const userInfo = req.body;
        // tao ban ghi moi
        const newUser = await userModel.create({
            ...userInfo,
            permissions: ['POST.CREATE']
        });
        // luu ban ghi
        // await newUser.save();
        // tra ve cho nguoi dung, 201: ghi thanh cong
        res.status(201).json(newUser);
    } catch (error) {
        res.status(error.status || 500 ).end(error.message || 'Internal server error');
    }
});

userRouter.get('/', (req, res) => {
    // console.log(req.session);
    // console.log('Current User: ', req.session.user);
  
    res.json({
      success: true,
    });
  });


module.exports = userRouter;
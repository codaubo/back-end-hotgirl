const express = require('express');
const bcryptjs = require('bcryptjs');
const userModel = require('../users/model');
const authRouter = express();
const admin = require('firebase-admin');

// register
authRouter.post('/register', async(req, res) => {
    try {
        const userInfo = req.body;
        // 403 chan ko cho gui len
        // check username/password/firstName/lastName empty
        if (userInfo.username == '') {
            return res.status(403).json({
                success: false,
                message: 'username must not be empty'
            });
        }
        if (userInfo.password == '') {
            return res.status(403).json({
                success: false,
                message: 'password must not be empty'
            });
        }
        if (userInfo.firstName == '') {
            return res.status(403).json({
                success: false,
                message: 'firstName must not be empty'
            });
        }
        if (userInfo.lastName == '') {
            return res.status(403).json({
                success: false,
                message: 'lastName must not be empty'
            });
        }
        // check username exist
        const existUsername = await userModel.findOne({ username: userInfo.username }).exec();
        if (existUsername) {
            return res.status(403).json({
                success: false,
                message: 'The username has been used'
            })
        }
        // check password regex
        const passwordRegex = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,12}$/).test(userInfo.password)
        if (!passwordRegex) {
            return res.status(403).json({
                success: false,
                message: 'Password must be contain at least one digit, one lower case, one upper case, 8 - 12 characters'
            });
        }

        // ma hoa password nguoi dung nhap vao = 10 ky tu
        // ko nen ma hoa qua dai > 12 se mat thoi gian
        const hashPassword = await bcryptjs.hash(userInfo.password, 10);

        // luu vao dtb
        // cac dieu kien if ben tren phai co return
        // neu ko thi van se luu du lieu sai vao trong db
        // vi khi thuc hien xong if no van chay tiep
        const newUser = await userModel.create({
            ...userInfo, // luu toan bo obj trong userInfo vao dtb
            password: hashPassword, // ghi de len password ben tren da ghi o userInfo
            permissions: ["POST.CREATE"],
        });

        res.status(201).json({
            message: 'Register success',
            success: true,
        });

    } catch (error) {
        res.status(500).end(error.message);
    }
});

// login
authRouter.post('/login', async(req, res) => {
    try {
        const loginInfo = req.body;
        console.log(loginInfo);
        // check username/password 
        if (!loginInfo.username || !loginInfo.password) {
            return res.status(403).json({ success: false, message: 'You must be input username or password ' })
        }
        // khi code co lam viec voi DB thi phai co return
        // ko thi code van se chay va bao loi o sever

        // if (loginInfo.password == '') {
        //     res.status(403).json({
        //         message: 'You must be input password ',
        //         success: false
        //     })
        // }
        const user = await userModel.findOne({
            username: req.body.username
        }).exec();
        // console.log(user)
        if (!user) {
            res.status(404).json({
                message: 'User not found',
                success: false,
            });
        } else {
            const comparePassword = await bcryptjs.compare(
                loginInfo.password,
                user.password
            );

            if (comparePassword) {
                // success
                // save session storage
                req.session.user = {
                    _id: user._id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    permissions: user.permissions,
                };
                req.session.save(); // luu cookie vao storage

                res.status(200).json({
                    message: 'Login success',
                    success: true,
                    id: user._id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                });
            } else {
                // flase
                res.status(404).json({
                    message: 'Password is not correct',
                    success: false,
                });
            }
        }
    } catch (error) {
        res.status(500).end(error.message);
    }
});

authRouter.post('/facebookOauth', async(req, res) => {
    try {
        const idToken = req.body.idToken;
        const result = await admin.auth().verifyIdToken(idToken);
        // console.log(result);
        res.status(200).json({
            success: true,
        })
    } catch (error) {
        res.status(500).end(error.message);
    }
});

authRouter.get('/test', (req, res) => {
    console.log(req.session.user);
    res.status(200).end();
});

// logout
authRouter.get('/logout', (req, res) => {
    try {
        req.session.destroy();
        res.status(200).json({
            message: 'Log out success',
            success: true,
        });
    } catch (error) {
        res.status(500).end(error.message);
    }
});
module.exports = authRouter
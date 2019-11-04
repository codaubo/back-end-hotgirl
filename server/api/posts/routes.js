const express = require('express');
const postModel = require('./model')
const postRouter = express.Router();

postRouter.post('/', async (req, res) => {
    try {
        // console.log(req.session.user);
        // console.log(req.session);
        if (!req.session.user) { // kiem tra dang nhap hay chua
            res.status(403).json({
                message: 'Unauthenticated',
            });
        } 
        // kiem tra xem co quyen dang bai ko ?
        if (req.session.user && req.session.user.permissions.indexOf('POST.CREATE') > -1) {
            const postInfo = req.body;
            // sau khi them bai viet moi, luu thong tin author cua user vua dang nhap
            const newPost = await postModel.create({
                ...postInfo,
                author: req.session.user._id,
            });
            res.status(201).json({
                success: true,
                data: newPost
            });
        } else {
            res.status(403).json({
                message: 'Unauthorized',
            });
        }

        
    } catch (error) {
        res.status(error.status || 500).end(error.message || "Internal server error");
    }
});

postRouter.get('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const postInfo = await postModel.findById(postId)
            // .populate('author', 'username firstName createdAt') // join 2 bang vao voi nhau, truong author
            .populate({
                path: 'author',
                select: 'username firstName lastName createdAt',
            })
            .exec();
        res.status(200).json(postInfo);
    } catch (error) {
        res.status(error.status || 500).end(error.message || "Internal server error");
    }
});
// postRouter.get('/:imageId', async (req, res) => {
//     try {
//         const { imageId } = req.params;
//         const imageInfo = await postModel.findById(imageId)
//             .populate
//     } catch (error) {
//         res.status(error.status || 500).end(error.message || "Internal server error");
//     }
// });

postRouter.get('/', async (req, res) => {
    try {
        const { pageNumber, pageSize } = req.query;

        // validate
        if (isNaN(pageNumber) || isNaN(pageSize)) {
            res.status(500).json({
                success: false,
                message: 'pageNumber && pageSize is invalid'
            })
        }

        if (pageNumber < 1 || pageSize < 1 || pageSize > 20) {
            res.status(500).json({
                success: false,
                message: 'pageNumber && pageSize is invalid'
            })
        }
        // query DB | 1: tang dan | -1: giam dan
        const totalRecord = await postModel.find().countDocuments();
        const data = await postModel.find()
        // const totalRecord = await postModel.find().countDocuments(); // dem tong so ban ghi , de tien cho viec hien thi bao nhieu trang
        // .sort({ dieu kien de sap xep bai post moi nhat })
        // bo qua N phan tu dau tien, de chuyen trang tra ve phan tu tiep theo
        .sort({createdAt: -1}) // giam dan, bai moi' nhat se o tren dau`
        .skip(pageSize * (pageNumber - 1)) 
        // so phan tu muon lay, neu ko thi no se lay tat ca cac phan tu thoa ma dieu kien   
        .limit(Number(pageSize)) 
        .exec();
        res.status(200).json({
            success: true,
            data: data,
            total: totalRecord,
        });
    } catch (error) {
        res.status(500).end(error.message);
    }
});
module.exports = postRouter;
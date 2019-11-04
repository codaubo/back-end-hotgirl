const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRouter = require('./api/users/routes');
const postRouter = require('./api/posts/routes');
const authRouter = require('./api/auth/routes');
const expressSession = require('express-session');
const cors = require('cors');
const admin = require('firebase-admin');
const uploadsRouter = require('./uploads/uploads.router');

const boostrap = async () => {
    try {
        // init app
        const app = express();
        // connect mongodb
        await mongoose.connect('mongodb://localhost:27017/techkids-hotgirl'); // ham bat dong bo

        const serviceAccount = require("./techkids-hotgirl-2ab39-firebase-adminsdk-p82z9-308068b5fb");

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://techkids-hotgirl-2ab39.firebaseio.com",
        }); 
        // use middlewares + routers
        app.use(cors({
            origin: ['http://hotgirl-back-end.herokuapp.com', 'https://hotgirlsocialnetwork.herokuapp.com'],
            credentials: true,

        }));
        const allowCrossDomain = function(req, res) {
            res.header('Access-Control-Allow-Origin', 'https://hotgirlsocialnetwork.herokuapp.com');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
        
        }
        app.use(allowCrossDomain);

        app.use(expressSession({
            secret: 'cobaudeptrai',
            resave: false,
            saveUninitialized: true,
            // cookie: { secure: true } // dinh dang HTTPS gui thi moi tra ve cookie
        })); 

        // app.use(express.static('public'));
        app.use(express.static('build'));
        app.get('/', (req, res) => {
            res.sendFile('./build/index.html');
        });

        app.use(bodyParser.json({limit: '200mb'})); // du lieu doc ghi tra ve la json
        app.use(bodyParser.urlencoded({ limit: '200mb', extended: false }));
        app.use('/api/users', userRouter);
        app.use('/api/posts', postRouter);  
        app.use('/api/auth', authRouter);
        app.use('/uploads', uploadsRouter);


        // start server
        await app.listen(process.env.PORT || 3001); // tao nhieu cong khi ma co nhieu app
        //PORT=5000 npm start
        // khong chay duoc o powershell => chay lenh $evn:PORT="5000";npm start
        // cmd: set PORT=5000 && npm start
        console.log(`Server start success ${process.env.PORT || 3001} ...`);

    }   catch (error) {
        console.log("Error happen: ", error);
    }
};

boostrap();


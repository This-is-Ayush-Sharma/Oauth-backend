const express = require('express');
const users = require('../models/user');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client("905154661025-11n1te9q1s70ohnnsqgcavpjhjcbatkc.apps.googleusercontent.com");

router.get('/msg', (req, res) => {
    res.json({
        "message": "hello world"
    })
});


router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    // console.log(name);
    const pass = await bcrypt.hash(password, 3);
    try {
        await users.create({
            name,
            email,
            password: pass
        })
        return res.json({ status: "ok" })
    }
    catch (error) {
        // console.log(error);
        if (error.code === 11000)
            return res.json({ status: "error", error: "duplicate email..." });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const data = await users.findOne({email}).lean();
        // console.log(data);
        if (data) {
            if(await bcrypt.compare(password,data.password))
            {
                const token = jwt.sign({
                    name:data.name,
                    email:data.email
                },process.env.JWT_SECRET);
                res.json({
                    status: "ok",
                    token:token
                })
            }
            else
            {
                res.json({
                    status: "error",
                    error:"Wrong password"
                })
            }
        }
        else
        {
            res.json({
                status: "error",
                error:"Email Dosen\'t exist"
            })
        }
    }
    catch (error) {
        console.log(error);
        return res.json({
            status: "error",
            error: "some error"
        })
    }
});

router.post('/googleRegister',(req,res)=>{
    const { tokenId } = req.body;

    client.verifyIdToken({idToken: tokenId , audience:"905154661025-67tlgshoj5of6fcsnmeq9tvv85svpph6.apps.googleusercontent.com"})
    .then(async response =>{
        const { email ,email_verified , name} = response.payload;
        if(email_verified === true)
        {
            const data = await users.findOne({email}).lean();
            if(data)
            {
                res.json({
                    status: "error",
                    error:"Email already registered"
                })
            }
            const pass = await bcrypt.hash(process.env.JWT_SECRET,3);
            await users.create({
                name,
                email,
                password:pass
            })
            return res.json({
                status:"ok",
            })
        }
        else
        {
            return res.json({
                status: "error",
                error: "Email not verified"
            })         
        }
    })
    .catch(err =>{
        console.log(err);
        return res.json({
            status: "error",
            error: "some error occured"
        }) 
    })
})

router.post('/googleLogin',(req,res)=>{
    const { tokenId } = req.body;

    client.verifyIdToken({idToken: tokenId , audience:"905154661025-67tlgshoj5of6fcsnmeq9tvv85svpph6.apps.googleusercontent.com"})
    .then(async response =>{
        const { email ,email_verified , name} = response.payload;
        if(email_verified === true){
            const data = await users.findOne({email}).lean();
            if(data)
            {
                const token = jwt.sign({
                    name:data.name,
                    email:data.email
                },process.env.JWT_SECRET);
                res.json({
                    status: "ok",
                    token:token
                })
            }
            else
            {
                res.json({
                    status: "error",
                    error:"Email not registered"
                })
            }
        }
        else
        {
            res.json({
                status: "error",
                error:"Email Dosen\'t exist"
            })
        }      
    })
})

module.exports = router;

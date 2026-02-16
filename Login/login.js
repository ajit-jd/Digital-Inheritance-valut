const express= require("express")
const router = express.Router()
const mysql = require('mysql2');

const bcrypt = require("bcrypt");
const saltRounds= 10;

// session
require('dotenv').config();
// console.log(process.env.SESSION_SECRET);
// middleware
const session = require('express-session');

router.use(session({
  secret: process.env.SESSION_SECRET, // Used to sign the session ID cookie
  resave: false,             // Don't save session if it wasn't modified
  saveUninitialized: false,  // Don't create session until something is stored
  cookie: { secure: false }  // Set to true if using HTTPS
}));



// Standard middleware for HTML form submissions
router.use(express.urlencoded({ extended: true })); 
// Standard middleware for JSON data (if used)
router.use(express.json()); 


// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'groupProject',        // your mysql user
    password: '1234',        // your mysql password
    database: 'digital_vault'  // we'll create this next
});

db.connect((err) => {
    if (err) {
        console.log('MySQL Error:', err);
        return;
    }
    console.log('✅ MySQL Connected!');
});

// Login signup route

router.get('/login',(req,res)=>{
    res.render('login')
    
})
router.post('/signup-submit', async(req,res)=>{
const { name, email, password,cpassword } = req.body;

    console.log(`Your name Name = ${name}`)
    const hashedPassword = await bcrypt.hash(password,saltRounds)
    console.log(hashedPassword)
    const sql = `INSERT INTO users (username, email, password) VALUES (?,?,?)`;

    db.query(sql,[name,email,hashedPassword],
        (err, result) => {
            if (err){
                console.log(err)
                return res.status(500).send('Insert Error: ' + err.message);
            } 
            else res.render('login')
        }
    );
    

})
router.post('/login-submit',(req,res)=>{
    const { email, password } = req.body;

    const sql = `SELECT id,email,password FROM users WHERE email=?`;


    db.query(sql,[email,password],
       async (err, result) => {
            console.log(`Your name Name = ${email}`)

            if (err){
                console.log(err)
                return res.status(500).send('Retriving Error: ' + err.message);
            } 
            if(result.length ==0){
                return res.status(401).send("Invalid email")
            }

            const user = result[0];
            try {
                const isMatch = await bcrypt.compare(password,user.password);
                if(isMatch){
                    req.session.userId = user.id;
                    req.session.userName = user.name;
                    console.log("Name "+req.session.userName)
                    return res.render('index',{shname: req.session.userName})
                }else{
                    return res.status(401).send("Invalid password");
                }
                
            } catch (e) {
                    return res.status(500).send(e + "Error while verifying password");
                
            }
        }
    );
})
router.get('/signup',(req,res)=>{   
    res.render('signup')
})





// // Test route
router.get('/mysqlC', (req, res) => {
    res.send('MySQL Connected! <a href="/test-db">Test DB</a>');
});

router.get('/test-db', (req, res) => {
    db.query('SELECT 1 + 1 as result', (err, results) => {
        if (err) {
            res.send('DB Error: ' + err.message);
        } else {
            res.send('DB Works! Result: ' + results[0].result);
        }
    });
});

router.get('/test-insert', (req, res) => {
    db.query(`INSERT INTO users (username, email, password) VALUES (${name}, ${email}, ${password})`, 
        (err, result) => {
            if (err) res.send('Insert Error: ' + err.message);
            else res.send('Inserted! ID: ' + result.insertId);
        }
    );
});
module.exports = router;


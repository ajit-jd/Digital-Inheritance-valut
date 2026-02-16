const express= require("express")
const app = express();
const path = require("path")

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Standard middleware for HTML form submissions
app.use(express.urlencoded({ extended: true })); 
// Standard middleware for JSON data (if used)
app.use(express.json()); 

app.set('view engine', 'ejs')

app.get('/',(req,res)=>{
    res.render('index')
})

const loginRouter = require("./Login/login")
app.use('/',loginRouter)






app.listen(3000)
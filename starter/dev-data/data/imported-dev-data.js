const fs = require('fs')
const mongoose =require('mongoose')
const dotenv= require('dotenv')
const Tour =require('../../../model/Toursmodel')
const User =require('../../../model/Usermodel')
const Review =require('../../../model/Reviewmodel')

dotenv.config({path:'../../../config.env'})
console.log(process.env.DATABASE)
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
//connect to host
mongoose.connect(DB,{
 useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
 }).then(() => { console.log("db connect succses")})

 const tours=JSON.parse( fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
 const users=JSON.parse( fs.readFileSync(`${__dirname}/users.json`,'utf-8'));
 const reviews=JSON.parse( fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));


const exportdata = async()=>{
try{
await Tour.create(tours)
// await User.create(users)
// await Review.create(reviews)
console.log(" data loadded sucssefully !")
process.exit()

}catch(err){
console.log(err)
}
}
const deletetdata = async()=>{
try{
await Tour.deleteMany()
// await User.deleteMany()
// await Review.deleteMany()
console.log(" data loadded deleted!")
process.exit()
}catch(err){
    
console.log(err)
}
}

console.log(process.argv)
if (process.argv[2] === '--import'){
    exportdata()
}
else if (process.argv[2] === '--delete'){
    deletetdata()
} 
 
//  node  starter/dev-data/data/imported-dev-data.js --import
//  node  starter/dev-data/data/imported-dev-data.js --delete
//  node  imported-dev-data.js --delete
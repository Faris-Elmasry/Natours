const AppError = require('../utilties/appError')
const Review= require("../model/Reviewmodel")

const catchAsync =require('./../utilties/catchAsync')
const factory=require("./handelerFactory")
 





exports.SetUserTourids=(req,res,next)=>{
    if (!req.body.tour) req.body.tour= req.params.tourId;
    if (!req.body.user) req.body.user= req.user.id;
    next()
}
////////////////
exports.Getreview =factory.getone(Review)
exports. createreview=  factory.createone(Review)    
exports.getallreview=  factory.getall(Review)
exports. Deletereview=factory.deleteone(Review)
exports. Updatereview=   factory.updateone(Review)

     
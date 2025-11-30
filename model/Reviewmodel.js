const mongoose =require("mongoose");
const Tour =require('../model/Toursmodel')


//requires
const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cannot be empty'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user'],
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour'],
    }

}
,
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }

,
    
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// //prevent duplicate reviews
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });


//query middleware
reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: 'user',
    //     select: "name photo"
    // }).populate({
    //     path: 'tour',  
    //     select: "name"
    // });
    this.populate({
        path: 'user',
        select: "name photo"
    }) 

    next();
});

//aggreagation pipeline to modify av rating every added rating
reviewSchema.statics.calcAveragerating = async function (tourId){
const stats = await this.aggregate([
    {
        $match: { tour: tourId }
    },
    {
        $group: { 
            _id: '$tour',
            nRating:{$sum:1},
            avgRating:{$avg:'$rating'},
            
        
        }
    },
])

if (stats.length > 0) {

    await Tour.findByIdAndUpdate(tourId,{
        ratingsQuantity:stats[0].nRating,
        ratingsAverage:stats[0].avgRating
    })
}else{
    await Tour.findByIdAndUpdate(tourId,{
        ratingsQuantity:0,
        ratingsAverage:4.5
    })
}
}

//modify after post to add post dont take next 
reviewSchema.post('save',function(){
    this.constructor.calcAveragerating(this.tour)
})





  

//modify after update and delete by getting the document from query by using findOne
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    next();
});
reviewSchema.post(/^findOneAnd/, async function() {
    await this.r.constructor.calcAveragerating(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

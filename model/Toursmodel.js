const mongoose =require('mongoose')
const slugify =require('slugify')
const validator =require('validator')
const User = require('./Usermodel')
const tourSchema = new mongoose.Schema({
    name: {
         type:String ,
         requireed:[true,"tour must have a name"] ,
         unique:true,//it not best practice 
         maxlength:[50,"max length is 50"],
         minlength:[10,"max length is 50"],
 
         
        },
        duration: {
         type:Number ,
         requireed:[true,"tour must have a duration"] ,
         
        },
        maxGroupSize: {
         type:Number ,
         requireed:[true,"tour must have a maxGroupSize"] ,
         
        },
        difficulty: { 
         type:String ,
         requireed:[true,"tour must have a difficulty"] ,
         enum:{
            values:['easy','medium','difficult'],
            message:"it should be one of them :easy ,medium ,difficult"
         }
        },

    price:{type:Number ,requireed:[true,"tour must have a price"]},
    priceDiscount:{type:Number ,
     validate : {
    validator:function(val){
       return   val < this.price
    },
    message:'discount number ({VALUE}) should be  below the regular price '
     }   
     
     },
    ratingsAverage:{
        type:Number,
        default:4.5,
        max:[5,"max num it should be 5"],
        min:[0,"min  it should be 0"],
        set :val => Math.round(val * 10 )  / 10 
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    pricediscount:Number,
    summary:{
        type:String,
        trim:true,
        requireed:[true,"tour must have a summary"]
    },
    description:{
        type:String,
        trim:true,
        
    }
    ,
    imageCover:{
        type:String,
        requireed:[true,"tour must have a imagecover"]
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    startDates:[Date],
    slug:String,
   
    secretTour:{
        type:Boolean,
        default:false
    },

    startLocation: {
        // GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
      },
      locations: [
        {
          type: {
            type: String,
            default: 'Point',
            enum: ['Point']
          },
          coordinates: [Number],
          address: String,
          description: String,
          day: Number
        }
      ],
    /*1-embedded  guides: Array*/
    /*2-referancing  */
    guides:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'User'
        }
    ]

},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }

)


//indexes 1 is asc and -1 is des


tourSchema.index({price : 1,ratingsAverage:-1})
tourSchema.index({slug : 1})
tourSchema.index({'startlocation.coordinates ': '2dsphere'})



tourSchema.virtual('durationweek').get(function(){
    return this.duration / 7
})
//1_doccumetn middleware
tourSchema.pre('save',function(next){
    this.slug=slugify(this.name,{upper :true})
    console.log(this.slug=slugify(this.name,{upper :true}))
    console.log(this.slug)
    next();
})
tourSchema.pre('save',function(next){
    // console.log('will save document')
    next()
})
 
tourSchema.post('save',function(doc,next){
// console.log(doc)
next()
})
 
//1.2 => emdedded way💖👻
// tourSchema.pre("save" , async function(next){
//     const  guidespromises = this.guides.map( async id => await User.findById(id)) 
//     this.guides = await Promise.all(guidespromises)
//     next();
// })



//2_query middle  middleware
tourSchema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}})
    this.start=Date.now()
    next()
})
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: "-__v -passwordChangedAt"  
    });

    next();  
});

//virtual populate
tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',
    localField:"_id"

})


tourSchema.post(/^find/,function(docs,next){
console.log(`query took ${Date.now() - this.start}`)
//    console.log(docs)
    next()
})
//3) aggregation Tour 
// tourSchema.pre('aggregate', function (next) {
//     if (!this.pipeline()[0]['$geoNear'])
//         this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
//     console.log(this)
// next()
// })
 
const Tour =mongoose.model("Tour",tourSchema)

 

module.exports =Tour;

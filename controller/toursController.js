const { query } = require('express');
const Tour =require('./../model/Toursmodel')
const ApiFeatures =require('./../utilties/apifeatures')
const catchAsync =require('./../utilties/catchAsync')
const AppError =require('./../utilties/appError')
const factory=require("./handelerFactory")
const multer = require('multer');
const sharp = require('sharp');
 





const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`starter/public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`starter/public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});







exports.aliasTopTour = (req,res,next) =>{
    req.query.limit='5'
    req.query.fields='name,price,duration,difficulty,summary,ratingsAverage'
    req.query.sort='-ratingsAverage,price'

    next()
 }



 exports.GetAllTours=  factory.getall(Tour)  
 exports.GetTour =  factory.getone(Tour,{path:'reviews'})  
 exports. CreateTour=   factory.createone(Tour)
 exports. UpdateTour=   factory.updateone(Tour)
 exports. DeleteTour= factory.deleteone(Tour)

  exports.Tourstats = catchAsync( async (req, res,next) => {
 
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: '$difficulty',
                    sumTours:{$sum: 1 } ,
                    avePrice: { $avg: '$price' },
                    aveRating: { $avg: '$ratingsAverage' },
                    //sumPrice: { $sum: '$price' },
                    mainPrice: { $min: '$price' },
                    maxprice: { $max: '$price' },
                }
            },
            {
                $sort:{avePrice:1}
            }
            // ,{
            //     $match :{ _id :{$ne:'easy'}}
            // }
        ]);

        if (stats.length === 0) {
            return res.status(404).json({
                status: "fail",
                message: "No tours found with the provided criteria."
            });
        }

     await   res.status(200).json({
            status: "success",
            data: stats
        });
    }  
 
  )

exports.monthlyplan = catchAsync( async(req,res,next) => {
 
const year = req.params.year 
const plan = await Tour.aggregate([
    {
         $unwind :'$startDates'
    } ,{
        $match : {
            startDates:{
                $gte: new Date(`${year}-01-01`), 
                $lte: new Date(`${year}-12-31`), 
            }
        }
    }
    ,{
        $group:{
           _id:  {$month:'$startDates'},
           numTourStarts : {$sum : 1},
           tour: { $push : '$name' }
        }
    },{
        $addFields : {month :  '$_id'}
    }
    
    ,
    { $project : {
        _id : 0 ,}},
    {
        $sort : {
            numTourStarts: -1
        }
    }
])
    res.status(200).json({
        status:"sucess",
        data:plan
       })
 
 
 
}
)


exports.getToursWithin = catchAsync(  async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
  
    if (!lat || !lng) {
        return next(new Error('Please provide latitude and longitude in the format lat,lng.'));
    }
  
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  
    try {
        const tours = await Tour.find({
            startLocation: {
                $geoWithin: {
                    $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius],
                },
            },
        });
    
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours,
            },
        });
    } catch (err) {
        next(err); // Pass any error to the error handling middleware
    }
});


exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
  
    // const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }
  
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          spherical: true,
          distanceMultiplier: 0.001
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);

    
  
    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  });
  



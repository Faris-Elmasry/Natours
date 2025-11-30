const catchAsync =require("../utilties/catchAsync")
const AppError =require("../utilties/appError")
 
const ApiFeatures =require('./../utilties/apifeatures')
exports. deleteone =Model=> 
    catchAsync( async(req, res,next) => {
        const doc =  await Model.findByIdAndDelete(req.params.id)
        if (!doc) {
            return next( new AppError ('not valid review id ',404))
        }
        res.status(204).json({
         status:"sucess",
         data:doc
        })
       
      })


exports. updateone =Model=> 
catchAsync( async (req, res,next) => {
 
    const doc =await Model.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
        //run validate 
      })
      if (!doc) {
        return next( new AppError ('not valid id ',404))
    }
         res.status(200).json({
          status:"sucess",
          data:doc }) 
         })


exports. createone =Model=>  catchAsync(async (req, res,next) => {
    const doc= await Model.create(req.body)
   
         res.status(201).json({
             status:"sucess",
             data:{
                 data:doc
                  }}
                  )
    })

   // factory.js
exports.getone = (model, popOptions) => catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id);

    if (popOptions) {
        query = query.populate(popOptions);
    }

    const doc = await query;

    if (!doc) {
        return next(new AppError('Not a valid ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: doc
    });
});

exports.getall = model => catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new ApiFeatures(model.find(filter), req.query)
        .filter()
        .sort()
        .limitfields()
        .paginate();

    const docs = await features.query;
    // const docs = await features.query.explain();

    res.status(200).json({
        status: 'success',
        results: docs.length,
        data: docs
    });
});

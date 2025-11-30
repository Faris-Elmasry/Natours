class ApiFeatures{
    constructor(query,queryString){
        this.query=query;
        this.queryString=queryString;
    }

    filter(){
const queryobj = {...this.queryString};
const excludedFeilds=["sort","limit","fields","page"];
excludedFeilds.forEach(e=> delete queryobj[e])
//advanced filtering due to the query object retuened without $ what is important syntax in mongodb 
let queryStr = JSON.stringify(queryobj);
queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g, math => `$${math}`);
this.query.find(JSON.parse(queryStr))
 
return this;
    }

    sort() {
        if (this.queryString.sort) {
          const sortBy = this.queryString.sort.split(',').join(' ');
          this.query = this.query.sort(sortBy);
        } 
    
        return this;
      }
limitfields(){
    if (this.queryString.fields){
        let fields =(this.queryString.fields).split(',').join(' ')
        this.query =this.query.select(fields)
    }else {
        this.query =this.query.select('-__v')
    }
    return this 
}

paginate(){
 
const page= (this.queryString.page) * 1 || 1 
const limit = this.queryString.limit * 1 || 100
const skip = ( page - 1 ) * limit 

this.query = this.query.skip(skip).limit(limit)
 
return this ;

}
}


module.exports = ApiFeatures;
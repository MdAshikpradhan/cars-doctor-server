const express = require('express')
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
require('dotenv').config()
const port = process.env.PORT || 5000;
console.log(process.env.DB_USER);


app.use(bodyParser.json());
app.use(cors());
app.use(express.static('admins'));
app.use(fileUpload());

app.get('/', (req, res) => {
  res.send('Hello World!')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.saiqg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const servicesCollection = client.db("alifCarWash").collection("carServices");
  const reviewsCollection = client.db("alifCarWash").collection("reviews");
  const adminsCollection = client.db("alifCarWash").collection("admins");
  const serviceOrdersCollection = client.db("alifCarWash").collection("serviceOrders");

  app.get('/services', (req, res) =>{
    servicesCollection.find()
      .toArray((err, products) => {
          res.send(products)
      })
  })



  app.get('/services/:id', (req, res) => {
    servicesCollection.find({_id: ObjectId(req.params.id)})
    .toArray((err, documents) =>{
        res.send(documents[0]);
    })
})



app.get('/serviceOrders', (req, res) =>{
  serviceOrdersCollection.find()
    .toArray((err, products) => {
        res.send(products)
    })
})



  app.get('/reviews', (req, res) => {
    console.log(req.query.email)
    reviewsCollection.find({email: req.query.email})
    .toArray((err, orders) => {
      res.send(orders)
    })
  })



  app.post('/addServices', (req, res) => {
      const newService = req.body;
      servicesCollection.insertOne(newService)
      .then(result => {
        console.log('addOrders', result)
          res.send(result.insertedCount > 0)
      })
  })


  app.post('/addServiceOrders', (req, res) => {
    const serviceOrder = req.body;
    serviceOrdersCollection.insertOne(serviceOrder)
    .then(result =>{
      res.send(result.insertedCount > 0)
    })
  })

  app.post('/ServiceOrdersByclient', (req, res) => {
    const serviceOrder = req.body;
    const email = req.body.email;
    adminsCollection.find({email: email})
    .toArray((err, admins) =>{
      const filter = {serviceOrder: serviceOrder.serviceOrder}
      if(admins.length === 0){
        filter.email = email;
      }
      serviceOrdersCollection.find(filter)
      .toArray((err, documents) =>{
        res.send(documents);
      })
    })
  })



  app.post('/addReviews', (req, res) =>{
    const newReview = req.body;
    reviewsCollection.insertOne(newReview)
    .then(result => {
        res.send(result.insertedCount > 0);
    })
    console.log(newReview);
})



  app.post('/addAAdmin', (req, res) => {
    const file = req.files.file;
    const name = req.files.name;
    const email = req.files.email;
    console.log(file, name, email)
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };

    adminsCollection.insertOne({ name, email, image })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
  })


  app.delete('/delete/:id', (req, res) => {
    servicesCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then(result =>{
        res.send(result.deletedCount > 0)
    })
})


  app.delete('/delete/ids/:id', (req, res) => {
    reviewsCollection.findOneAndDelete({_id: ObjectId(req.params.id)})
    .then(result =>{
        res.send(result.deletedCount > 0)
    })
})

//   client.close();
});


app.listen(port, () => {

})
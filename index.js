const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 5000
require('dotenv').config()
const app = express()
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vqva6ft.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const addedProductCollection = client.db('ProductsDB').collection('addedProducts')
    const cartCollection = client.db('ProductsDB').collection('MyCart')
    const productCollection = client.db('ProductsDB').collection('Product')

      
    app.get('/', (req, res) => {
      res.send('Server is running')
    })
    
    app.get('/featured', async (req, res) => {
      const products = productCollection.find()
      const result = await products.toArray()
      res.send(result)

    })
    app.get('/featured/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await productCollection.findOne(query)
      res.send(result)
    })

   
    app.post('/addedProducts', async (req, res) => {
      const products = req.body
      const result = await addedProductCollection.insertOne(products)
      res.send(result)


    })
    app.get('/addedProducts', async (req, res) => {
      const productsAdded = addedProductCollection.find()
      const result = await productsAdded.toArray()
      res.send(result)

    })

    app.get('/addedProducts/:brand_name', async (req, res) => {
      const query = { brand_name: req.params.brand_name }
      const brand = addedProductCollection.find(query)
      const result = await brand.toArray()
      res.send(result)
    })
    app.get('/addedProducts/:name/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await addedProductCollection.findOne(query)
      res.send(result)
    })
 

 

    app.put('/addedProducts/:name/:id', async (req, res) => {
      const id = req.params.id
      const productUpdate = req.body
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          image: productUpdate.image,
          name: productUpdate.name,
          brand_name: productUpdate.brand_name,
          type: productUpdate.type,
          price: productUpdate.price,
          description: productUpdate.description,
          rating: productUpdate.rating
        },

      };
      const result = await addedProductCollection.updateOne(filter, updateDoc, options)
      res.send(result)
    })

    // cart related code 


    app.post('/cart', (req, res) => {
      const product = req.body
      const result = cartCollection.insertOne(product)
      res.send(result)
    })
    app.get('/cart/:email', async (req, res) => {
      const query = {email: req.params.email}
      const cursor = cartCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/cart/:email/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id:new ObjectId(id) }
      console.log(query)
      const result = await cartCollection.findOne(query)
      res.send(result)
    })



    app.delete('/cart/:email/:id', async (req, res) => {
      const id = req.params.id
      const query = {_id:new ObjectId(id)}
      const result = await cartCollection.deleteOne(query)
      res.send(result)
    })

   
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Server is running at port: ${port}`)
})
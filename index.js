const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { MongoClient, ServerApiVersion } = require("mongodb");
const { brands } = require("./brands");
// const { products } = require("./products");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.6rxve42.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productCollection = client.db("productDB").collection("products");

    // const inputFakeData = await productCollection.insertMany(products);
    // console.log(inputFakeData);

    const brandCollection = client.db("productDB").collection("brands");

    // const inputFakeBrandData = await brandCollection.insertMany(brands);
    // console.log(inputFakeBrandData);

    app.get("/", (req, res) => {
      res.send("<h1><center>Hello Folks, Welcome to Backend.</center></h1>");
    });

    app.get("/products", async (req, res) => {
      const products = await productCollection.find().toArray();
      res.send(products);
    });

    app.get("/brands", async (req, res) => {
      const brands = await brandCollection.find().toArray();
      res.send(brands);
    });

    app.get("/trending", async (req, res) => {
      const filter = { isNew: true };
      const trendingProducts = await productCollection.find(filter).toArray();
      res.send(trendingProducts);
    });

    app.get("/products/brand/:brandName", async (req, res) => {
      const brandName = req.params.brandName;
      const filter = { brand: brandName };
      const brandProducts = await productCollection.find(filter).toArray();
      res.send(brandProducts);
    });

    app.post("/products/new", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`server running at port: ${port}`);
});

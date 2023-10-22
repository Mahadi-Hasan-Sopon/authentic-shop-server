const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const { brands } = require("./brands");
// const { products } = require("./products");

const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(
  cors({
    origin: [
      "http://localhost",
      "https://authentic-shop-f5f81.web.app",
      "https://authentic-shop-f5f81.firebaseapp.com",
      "https://authentic-shop.surge.sh",
      "http://authentic-shop.surge.sh",
      "*",
    ],
  })
);
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
    // await client.connect();

    const productCollection = client.db("productDB").collection("products");

    // const inputFakeData = await productCollection.insertMany(products);
    // console.log(inputFakeData);

    const brandCollection = client.db("productDB").collection("brands");

    // const inputFakeBrandData = await brandCollection.insertMany(brands);
    // console.log(inputFakeBrandData);

    const cartItems = client.db("productDB").collection("cartItems");

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

    app.get("/cart", async (req, res) => {
      const products = await cartItems.find().toArray();
      // console.log(products);
      res.send(products);
    });

    app.get("/brand/:brandName", async (req, res) => {
      const brandName = req.params.brandName;
      // const filter = { brand: brandName };
      const filter = { brand: { $regex: new RegExp(brandName, "i") } };
      const brandProducts = await productCollection.find(filter).toArray();
      res.send(brandProducts);
    });

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      // const options = { projection: { _id: 0 } };
      const product = await productCollection.findOne(query);
      // console.log(product);
      res.send(product);
    });

    app.post("/products/new", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
      console.log(`A product was inserted with the _id: ${result.insertedId}`);
    });

    app.post("/addToCart", async (req, res) => {
      const product = req.body;
      // console.log(product);
      const cursor = { _id: product._id };
      const isExist = await cartItems.findOne(cursor);
      console.log(isExist);

      const result = await cartItems.insertOne(product);
      res.send(result);
    });

    app.put("/product/update/:id", async (req, res) => {
      const id = req.params.id;
      const product = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const {
        title,
        brand,
        category,
        price,
        image,
        rating,
        stock,
        description,
      } = product;
      const updatedProduct = {
        $set: {
          title,
          brand,
          category,
          price,
          image,
          stock,
          rating: { ...rating },
          description,
        },
      };

      const result = await productCollection.updateOne(
        filter,
        updatedProduct,
        options
      );
      res.send(result);
      console.log(
        `${result.matchedCount} product(s) matched the filter, updated ${result.modifiedCount} product(s)`
      );
    });

    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: id };
      console.log(filter);
      const result = await cartItems.deleteOne(filter);
      console.log(result);
      res.send(result);
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

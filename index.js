const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;
//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9very.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("drone_zone");
    const dronesCollection = database.collection("drones");
    const usersCollection = database.collection("users");
    const ordersCollection = database.collection("orders");
    const reviewsCollection = database.collection("reviews");
    const blogsCollection = database.collection("blogs");

    // get all drones
    app.get("/drones", async (req, res) => {
      const result = await dronesCollection.find({}).toArray();
      res.send(result);
    });
    app.get("/dronesHome", async (req, res) => {
      const cursor = dronesCollection.find({});
      const result = await cursor.skip(0).limit(6).toArray();
      res.send(result);
    });
    // save user
    app.post("/saveUser", async (req, res) => {
      const result = await usersCollection.insertOne(req.body);
      res.send(result);
    });
    // single drone details
    app.get("/drone/:id", async (req, res) => {
      const id = req.params.id;
      const result = await dronesCollection.findOne({ _id: ObjectId(id) });
      res.send(result);
    });
    // post orders
    app.post("/orders", async (req, res) => {
      const result = await ordersCollection.insertOne(req.body);
      res.send(result);
    });
    // get orders based on user
    app.get("/myOrders/:email", async (req, res) => {
      const email = req.params.email;
      const result = await ordersCollection.find({ email }).toArray();
      res.send(result);
    });

    // cancel order
    app.delete("/cancelOrder", async (req, res) => {
      const droneId = req.body;
      const result = await ordersCollection.deleteOne({
        _id: ObjectId(droneId),
      });
      res.send(result);
    });
    // post review
    app.post("/review", async (req, res) => {
      const result = await reviewsCollection.insertOne(req.body);
      res.send(result);
    });

    //get review
    app.get("/review", async (req, res) => {
      const result = await reviewsCollection.find({}).toArray();
      res.send(result);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email };
      const user = await usersCollection.findOne(filter);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.send({ admin: isAdmin });
    });

    app.post("/addService", async (req, res) => {
      const result = await dronesCollection.insertOne(req.body);
      res.send(result);
    });

    // delete products
    app.delete("/deleteProduct", async (req, res) => {
      const id = req.body;
      const result = await dronesCollection.deleteOne({
        _id: ObjectId(id),
      });
      res.send(result);
    });

    // get all orders
    app.get("/orders", async (req, res) => {
      const result = await ordersCollection.find({}).toArray();
      res.send(result);
    });

    // update status
    app.put("/updateStatus", async (req, res) => {
      const filter = { _id: ObjectId(req.body) };
      const result = await ordersCollection.updateOne(filter, {
        $set: {
          status: "Shipped",
        },
      });
      res.send(result);
    });
    // get blogs
    app.get("/blogs", async (req, res) => {
      const result = await blogsCollection.find({}).toArray();
      res.send(result);
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express() 
require('dotenv').config() 
var jwt = require('jsonwebtoken'); 
const cors = require('cors');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o4gyyvr.mongodb.net/?retryWrites=true&w=majority`;


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

    const classCollection = client.db("eduMentor").collection("allClass");
    const userCollection = client.db("eduMentor").collection("users");
    const reviewCollection = client.db("eduMentor").collection("review");

       // jwt related Api

       app.post('/jwt',async(req,res)=>{
        const user =req.body;
        console.log(req.headers)
        const token =jwt.sign(user,process.env.ACCESS_TOKEN ,{expiresIn:'1h'})
        res.send({ token })
      })


       // middleWare

       const verifyToken= (req,res,next)=>{
        console.log('khauyweghfyre',req.headers.authorization)
        if(!req.headers.authorization){
          return res.status(401).send({message: 'forbidden access'})
  
        }
        const token =req.headers.authorization.split(' ')[1]
        jwt.verify(token , process.env.ACCESS_TOKEN,(err, decoded)=>{
          if(err){
            return res.status(401).send({message: 'forbidden access'})
          }
          req.decoded= decoded;
          next()
        })
      }
  
    
//   user APi

app.post('/users',async(req,res)=>{
    const user =req.body;
    // insert email if use dose not exits
    const query={email : user.email}
    const existingUser= await userCollection.findOne(query);
    if(existingUser){
      return res.send({message:'user Already exists', insertedId:null})
    }
    const result =await userCollection.insertOne(user);
    res.send(result)
  })

  app.get('/users',async(req,res)=>{
    const email =req.query.email;
    const quary ={email:email}
    const result= await userCollection.find(quary).toArray();
    res.send(result)   
})


    app.get('/allClass' ,async(req,res)=>{
      const cursor =classCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/allreview' ,async(req,res)=>{
        const cursor =reviewCollection.find();
        const result = await cursor.toArray();
        res.send(result)
      })

    app.get('/allClass/:id', async(req,res)=>{
        const id = req.params.id;
        const query = { _id: new ObjectId(id)}
        const options = {
       
          projection: {  title:1,instructor:1, category: 1,rating: 1,price: 1,description: 1,image: 1,total_enrollment: 1 },
        };
        const result =await classCollection.findOne(query ,options);
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


app.get('/', (req, res) => {
  res.send('Hello World Oyshi!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
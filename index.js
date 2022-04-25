const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var jwt = require('jsonwebtoken');

// middleware 
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Car Service')
});


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.4wnsh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run () {
    try{
        await client.connect();
        const serviceCollection = client.db("CarService").collection("services");
        const orderCollection = client.db("CarService").collection("orders");

        // Auth token 
        app.post('/login', async(req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({accessToken});
        });

        // service get 
        app.get('/services', async(req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        // service detail get 
        app.get('/service/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        // Service post 
        app.post('/service/add', async(req, res) =>{
            const newService = req.body;
            const addedService = await serviceCollection.insertOne(newService);
            res.send(addedService);
        });

        // Service Delete 
        app.delete('/manage/delete/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const action = await serviceCollection.deleteOne(query);
            res.send(action);
        });


        // =================== Order collection =====================

        // posting order 
        app.post('/order', async(req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        });

        // getting orders 
        app.get('/orders', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        });

    }
    finally{
        
    }
}
run().catch(console.dir);



// Listen server 
app.listen(port, () => {
    console.log('listening port', port);
});


const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config()
const { v4: uuidv4 } = require('uuid');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tfgke.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());

const port = 5000



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const IslavoUsers = client.db("ISLAVO").collection("IslavoUser");

    app.post('/addusers', (req, res) => {
        const users = req.body;
        IslavoUsers.insertOne(users)
            .then(result => {
                res.send(result)
            })
    })

    app.get("/userdata", (req, res) => {
        IslavoUsers.find({})
            .toArray((err, document) => {
                res.send(document)
            })
    })

    const IslavoPayment = client.db("ISLAVO").collection("IslavoPayment");

    app.post("/userpayment", (req, res) => {
        console.log(req.body);
        const transactionId = uuidv4();
        const data = new FormData();
        data.append('amount', '64.2');
        data.append('transaction_id', `${transactionId}`);
        data.append('success_url', 'https://mydomain.com/success');
        data.append('fail_url', 'https://mydomain.com/fail');
        data.append('customer_name', req.body.Email);
        data.append('customer_mobile', req.body.Phone);
        data.append('purpose', 'Online Payment');
        data.append('payment_details', '');

        const config = {
            method: 'post',
            url: 'https://api.sheba.xyz/v1/ecom-payment/initiate',
            headers: { 
                'client-id': `${process.env.CLIENT_ID}`, 
                'client-secret': `${process.env.CLIENT_SECRET}`,
                ...data.getHeaders()
            },
            data : data
        };

        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                // IslavoPayment.insertOne(transactionId)
                // .then(result => {
                //     res.send(result)
                // })
                res.send({paymentLink: response.data.data.link});
                getTransactionDetails();
            })
            .catch(function (error) {
                res.send(error)
            });
    })
});


// client.connect(err => {
//     const users = client.db("ISLAVO").collection("service");
//     console.log(err);
//     app.post('/users', (req, res) => {
//         const users = req.body;
//         users.insertOne(users)
//             .then(result => {
//                 res.send(result)
//             })
//     })
// });


// app.listen(port, () => {
//     console.log(`Example app listening at http://localhost:${port}`)
// })

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || port)

function getTransactionDetails(){
    var data = new FormData();
    data.append('transaction_id', 'sjhdf86sdf541sdfsd345v');

    var config = {
    method: 'get',
    url: 'https://api.sheba.xyz/v1/ecom-payment/details',
    headers: { 
        'Accept': 'application/json', 
        'client-id': '215300000', 
        'client-secret': 'BvzPgftoG1HQyEL8hYkwGTBxC47QZtqag0KOwgIJmXHZnr1EKIhb4UHtduPyizzi5bT6QEuFhm3VNEcmlpzPFPWUvWp5YdhkhJpmXzPVofLg', 
        ...data.getHeaders()
    },
    data : data
    };

    axios(config)
    .then(function (response) {
    console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
    console.log(error);
    });
}

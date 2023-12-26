const express = require('express');
const http = require('http');
const https = require('https');
const app = express();
const port = 3000;
const httpServer = http.Server(app);
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});



app.get('/proxy', (req, res) => {
  console.log(req.query)
    const url = req.query.url;
    // Utiliza 'https.get' para realizar la solicitud y 'pipe' para enviar la respuesta al cliente
    https.get(url, (responseFromOtherServer) => {
      let rawData = '';
      responseFromOtherServer.on('data', (chunk) => {
        rawData += chunk;
      });
      responseFromOtherServer.on('end', () => {
        try {
          const jsonData = JSON.parse(rawData);
          res.json(jsonData);
        } catch (e) {
          console.error(e.message);
          res.status(500).json({ type: 'error', message: e.message });
        }
      });
    }).on('error', (err) => {
        res.status(500).json({ type: 'error', message: err.message });
    });
});



app.post('/proxy_post', async (req, res) => {
  console.log(req.body)
    let data = JSON.stringify({
        "parameters": req.body.parameters
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: req.body.url,
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios.request(config)
        .then((response) => {
            res.json(response.data);
        })
        .catch((error) => {
            res.json(error);
        });
});

httpServer.listen(3000, () => {
    console.log('go to http://localhost:3000');
});
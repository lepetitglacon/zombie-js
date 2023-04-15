const express = require('express')
var cors = require('cors')
const path = require("path");
const app = express()
const port = 3000

app.use(cors())

app.use(express.static('dist'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/dist/index.html'));
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

const express = require('express')
const server = express()

server.get('/:id', (req, res) => {
    const { id } = req.params
    return res.send(`FOIS ${id}`)
})

server.listen(3001)
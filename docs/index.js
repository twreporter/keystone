const express = require('express')

const app = express()

const  options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html'],
  index: false,
}


app.use(express.static('.', options))

app.listen(3030)


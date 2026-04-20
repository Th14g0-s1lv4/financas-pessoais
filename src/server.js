const express = require('express');
const cors    = require('cors');
const path    = require('path');
const routes  = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api', routes);

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
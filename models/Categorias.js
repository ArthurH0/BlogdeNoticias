const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Categoria = new Schema({
  nome: String,
  slug:String,
  data: { type: Date, default: Date.now }
})

mongoose.model('categorias',Categoria) 
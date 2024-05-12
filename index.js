
//Modulos//

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const admin = require('./routes/admin')
const usuarios = require('./routes/usuario')
const bodyParser = require('body-parser')
const handlebars = require('express-handlebars')
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash');
const Postagem = mongoose.model('postagens')
const Categoria = mongoose.model('categorias')
const Usuario = mongoose.model('usuarios')
const passport = require('passport');
require("./config/auth")(passport)



//Configurações

//Sessão
app.use(session({
  secret: "session",
  resave: true,
  saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
//Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg")
  res.locals.error_msg = req.flash("error_msg")
  res.locals.error = req.flash("error")
  res.locals.user = req.user || null;
  next();
})

//Config BodyParser//
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Config Handlebars//
app.engine('handlebars', handlebars.engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
//Config Mongoose//
mongoose.connect('mongodb+srv://ArthurH1:123@cluster0.l99ymue.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('Conectado ao banco')
  }).catch((erro) => {
    console.log(erro)
  })
//Public
app.use(express.static(path.join(__dirname, 'public')))


//Rotas
app.use('/admin', admin)
app.use('/usuarios', usuarios)

app.get('/', (req, res) => {
  const { titulo} = req.query
  if(titulo){
    Postagem.find({ titulo: { $regex: titulo}}).lean().populate('categoria').sort({ data: 'desc' })
    .then((postagens) => {
      res.render('index/index', { postagens: postagens });
    })
    .catch((erro) => {
      req.flash('error_msg', 'Erro ao pesquisar postagens');
      res.redirect('/');
    });
  }else{
    Postagem.find().populate('categoria').sort({ data: 'desc' }).lean()
    .then((postagens) => {
      res.render('index/index', { postagens: postagens });
    })
    .catch((erro) => {
      req.flash('error_msg', 'Erro ao carregar postagens');
      res.redirect('/admin/posts');
    });
  }
})

//Postagem Leia Mais
app.get('/conteudo/:slug', (req, res) => {
  Postagem.findOne({ slug: req.params.slug }).lean().then((postagem) => {
    if (postagem) {
      res.render('index/conteudo', { postagem: postagem })
    }
    else {
      req.flash('error_msg', 'Essa postagem não existe')
      res.redirect('/')
    }
  })
    .catch((erro) => {
      console.log(erro)
      req.flash('error_msg', 'Houve um erro ao carregar o conteudo da postagem')
      res.redirect('/')
    })
})

//Rotas para procurar posts por categorias
app.get('/categorias', (req, res) => {
  Categoria.find().lean().then((categorias) => {
    res.render('index/procurarcat', { categorias: categorias })
  })
})

app.get('/categorias/:slug' , (req,res) =>{
  Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{
    if(categoria){
      Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{
        res.render('index/postcateg' , {postagens: postagens})
      }).catch((erro) =>{
        console.log(erro)
        req.flash('error_msg' , 'Não foi possivel carregar postagens')
        res.redirect('/')
      })
    }
  }).catch((erro) =>{
    console.log(erro)
    req.flash('error_msg' , 'Não foi possivel carregar categorias')
    res.redirect('/')
  })
})

app.listen(8081, () => {
  console.log('Servidor rodando na porta', 8081)
})
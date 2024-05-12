const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categorias')
const Categoria = mongoose.model('categorias')
require('../models/Postagens')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin')

router.get('/', eAdmin, (req,res) =>{
  res.render('admin/index')
})

//Listando categorias

router.get('/categorias',eAdmin, (req,res) =>{
  const { nome } = req.query; 

  if (nome) {
    Categoria.find({ nome: { $regex: nome} }).sort({ data: 'desc' }).lean()
      .then((categorias) => {
        res.render('admin/categorias', { categorias: categorias });
      })
      .catch((erro) => {
        req.flash('error_msg', 'Erro ao pesquisar postagens');
        res.redirect('/admin/categorias');
      });
  } else {
    Categoria.find().sort({ data: 'desc' }).lean()
      .then((categorias) => {
        res.render('admin/categorias', { categorias: categorias });
      })
      .catch((erro) => {
        req.flash('error_msg', 'Erro ao carregar postagens');
        res.redirect('/admin/categorias');
      });
  }
});

//Criando Categorias

router.get('/categorias/add', eAdmin,  (req,res) =>{
  res.render('admin/categoriasadd')
})

router.post('/categorias/nova', eAdmin,   (req,res) =>{
   var erros = [];

   if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome ==null){
    erros.push({text:"Nome inválido"})
   }

   if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    erros.push({text: "Slug inválido"})
   }

   if(erros.length > 0){
    res.render('admin/categoriasadd', {erros: erros})
   }
   else{

    const NovaCategoria = {
      nome:req.body.nome,
      slug:req.body.slug
    }
  
    new Categoria(NovaCategoria).save().then(() =>{
      req.flash("success_msg", "Categoria criada com sucesso")
      res.redirect("/admin/categorias")
    }).catch(() => {
      req.flash("error_msg", "Categoria não criada")
      res.redirect("/admin")
    })
   } 
})
//Edit Categorias

router.get('/categorias/edit/:id', eAdmin,   (req,res) =>{
  Categoria.findOne({_id:req.params.id}).lean().then((categorias)=>{
        res.render('admin/editcategorias', {categorias:categorias})
  }).catch((erro) =>{
    req.flash('error_msg', 'Essa categoria não existe')
    res.redirect('/admin/categorias')
  }) 
})


router.post('/categorias/edit',  eAdmin,  (req,res) =>{
  Categoria.findOne({_id:req.body.id}).then((categoria) =>{
    categoria.nome = req.body.nome
    categoria.slug = req.body.slug

    categoria.save().then(() =>{
      req.flash('success_msg' , 'Categoria editada com sucesso')
      res.redirect('/admin/categorias')
    }).catch((err) =>{
      req.flash('error_msg' , 'Categoria não editada')
    })

  }).catch((err) =>{
    req.flash("error_msg", "Categoria não criada")
    res.redirect("/admin/categorias")
  })
})



//Deletar categorias
router.post('/categorias/deletar',  eAdmin,  (req,res) =>{
  Categoria.deleteOne({_id:req.body.id}).then(() =>{
    req.flash('success_msg', 'Categoria deletada com sucesso')
    res.redirect('/admin/categorias')
  }).catch(() =>{
    req.flash('error_msg', 'Houve um erro ao deletar a categoria')
    res.redirect('/admin/categorias')
  })
})

//Postagens
//Listar postagens
router.get('/posts', eAdmin,   (req, res) => {
  const { titulo } = req.query; 

  if (titulo) {
    Postagem.find({ titulo: { $regex: titulo}}).lean().populate('categoria').sort({ data: 'desc' })
      .then((postagens) => {
        res.render('admin/postagens', { postagens: postagens });
      })
      .catch((erro) => {
        req.flash('error_msg', 'Erro ao pesquisar postagens');
        res.redirect('/admin/posts');
      });
  } else {
    Postagem.find().populate('categoria').sort({ data: 'desc' }).lean()
      .then((postagens) => {
        res.render('admin/postagens', { postagens: postagens });
      })
      .catch((erro) => {
        req.flash('error_msg', 'Erro ao carregar postagens');
        res.redirect('/admin/posts');
      });
  }
});

//Adicionar postagens
router.get('/posts/add', eAdmin,   (req,res) =>{
  Categoria.find().lean().then((categorias) =>{
    res.render('admin/addpostagens', {categorias:categorias})
  }).catch((erro)=>{
    req.flash('error_msg' ,'Erro ao carregar o formulário')
    res.redirect('/admin')
  })
})

router.post('/posts/novo' , eAdmin,   (req,res) =>{
  const NovaPostagem ={
    titulo: req.body.titulo,
    slug: req.body.slug,
    descricao: req.body.descricao,
    conteudo: req.body.conteudo,
    categoria: req.body.categoria
  }
    new Postagem(NovaPostagem).save().then(() =>{
      req.flash('success_msg', 'Postagem criada com sucesso')
      res.redirect('/admin/posts')
    })
  .catch(() =>{
    req.flash('error_msg', 'Houve um erro ao criar a postagem')
    res.redirect('/admin/posts')
  })
})

//Editar postagens
router.get('/posts/edit/:id', eAdmin,   (req,res)=>{
  Postagem.findOne({_id:req.params.id}).lean().then((postagem,) =>{
    Categoria.find().lean().then((categorias) =>{
      res.render('admin/editpostagens' , {postagem: postagem ,categorias: categorias})
    })
  })
})

router.post('/posts/edit/novo',  eAdmin,  (req,res)=>{
  Postagem.findOne({_id:req.body.id}).then((postagem) =>{
    postagem.titulo = req.body.titulo
    postagem.slug = req.body.slug
    postagem.descricao = req.body.descricao
    postagem.conteudo = req.body.conteudo
    postagem.categoria = req.body.categoria

    postagem.save().then(()=>{
    req.flash('success_msg', 'Post editado com sucesso')
    res.redirect('/admin/posts')
    })
  })
})

//Apagar postagem
router.post('/posts/deletar',  eAdmin,  (req,res) =>{
  Postagem.deleteOne({_id:req.body.id}).then(()=>{
    req.flash('success_msg', 'Postagem apagada com sucesso')
    res.redirect('/admin/posts')
  }).catch(() =>{
    req.flash('error_msg', 'Houve um erro ao apagar a postagem')
    res.redirect('/admin/posts/')
  })
}) 

module.exports = router;
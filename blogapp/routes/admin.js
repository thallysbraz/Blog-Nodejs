const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

require("../models/Categoria")
require("../models/Postagem")

const Categoria = mongoose.model("categorias");
const Postagem = mongoose.model("postagens");
const {eAdmin} = require("../helpers/eAdmin");

router.get("/", eAdmin, (req, res) => {
    res.render("admin/index");
});

//rota para categorias
router.get("/categorias", eAdmin, (req, res) => {
    Categoria.find().sort({date: 'desc'}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias});    
    }).catch((err) => {
        req.flash("error_msg", "Houve error ao listar as categorias");
        req.redirect("/admin");
    })
});

//view para categorias/add
router.get("/categorias/add", eAdmin, (req, res) => {
    res.render("admin/addcategorias");
});

//rota para validar e inserir nova categoria no Banco de Dados
router.post("/categorias/nova", eAdmin, (req, res) =>{
    
    var erros = [];


    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome invalido"});
    }
    
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug invalido"});
    }
    
    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros});
    }
    else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(()=> {
            req.flash("success_msg", "Categoria criada com sucesso!");
            res.redirect("/admin/categorias");
        }).catch((err) => {
            req.flash("error_msg", "Error ao salvar a categoria, tente novamente!");
            res.redirect("/admin");
        });
    }
});

//rota par view categoria/edit
router.get("/categorias/edit/:id", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).then((categoria) => {
        res.render("admin/editcategorias", {categoria: categoria});
    }).catch((err) => {
        req.flash("error_msg", "Essa categoria não existe");
        res.redirect("/admin/categorias");
    });
});

//rota para validar e registrar edição na categoria
router.post("/categorias/edit", eAdmin, (req, res) => {
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome invalido"});
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug invalido"});
    }

    if(erros.length > 0){
        req.flash("error_msg", "Error ao salvar a categoria, tente novamente!");
        res.redirect("/admin/categorias");
        
    }
    else{
        Categoria.findOne({_id: req.body.id}).then((categoria) => {

            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash("success_msg", "categoria editada com sucesso")
                res.redirect("/admin/categorias");
            }).catch((err) => {
                req.flash("error_msg", "Houve erro ao salvar a edição da categoria");
                res.redirect("/admin/categorias");
            });

        }).catch((err) => {
            req.flash("error_msg", "Houve um error ao editar a categoria");
            res.redirect("/admin/categorias");
        });
    }

});

//rota para deletar categoria
router.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.remove({_id: req.body.id}).then(() =>{
        req.flash("success_msg", "Categoria deletada com sucesso!");
        res.redirect("/admin/categorias");
    }).catch((err) => {
        req.flash("error_msg", "Error ao deletar categoria!");
        res.redirect("/admin/categorias");
    });
});

//rota da pagina de post
router.get("/postagens", eAdmin, (req, res) =>{
    Postagem.find().populate("categoria").sort({data:"desc"}).then((postagens) =>{
        res.render("admin/postagens", {postagens: postagens});
    }).catch((err) => {
        req.flash("error_msg", "Houve error ao listar posts!");
        res.redirect("admin/postagens")
    });
    
});

//rota para criar post
router.get("/postagens/add", eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("admin/addpostagem", {categorias: categorias});
    }).catch((err) => {
        req.flash("error_msg", "Houve error ao carregar o formulario");
        res.redirect("/admin")
    }) 
});

//rota para validar e inserir post no Banco de Dados 
router.post("/postagens/nova", eAdmin, (req, res) => {
    var erros=[];

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, registre uma categoria"});
    }

    if(erros.length > 0){
        res.render("admin/addpostagem", {erros: erros})
    }
    else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!");
            res.redirect("/admin/postagens");
        }).catch((err) => {
            req.flash("error_msg", "Houve erro ao salvar postagem");
            res.redirect("/admin/postagens");
        });
    }
});

// editar post
router.get("/postagens/edit/:id", eAdmin, (req, res) => {

    Postagem.findOne({_id: req.params.id}).then((postagem) => {
        Categoria.find().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem});
        }).catch((err) => {
            req.flash("error_msg", "Houve error ao listar as categorias");
            res.redirect("/admin/postagens");
        });
    }).catch((err) => {
        req.flash("error_msg", "Houve error ao carregar o formulario de edição");
        res.redirect("/admin/postagens");
    });
});

//rota para atualizar os dados do post
router.post("/postagem/edit", eAdmin, (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        postagem.titulo = req.body.titulo,
        postagem.slug = req.body.slug,
        postagem.descricao = req.body.descricao,
        postagem.conteudo = req.body.conteudo,
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash("success_msg", "post editado com sucesso!");
            res.redirect("/admin/postagens");
        }).catch((err) => {
            req.flash("error_msg", "Error interno");
            res.redirect("/admin/postagens");
        });
    }).catch((err) => {
        req.flash("error_msg", "Error ao salvar a edição");
        res.redirect("/admin/postagens");
    })
});

//rota para deletar 
router.get("/postagens/deletar/:id", eAdmin, (req, res) => {
    Postagem.remove({_id: req.params.id}).then(()=> {
        req.flash("success_msg", "Sucesso ao deletar post!");
        res.redirect("/admin/postagens");
    }).catch((err) => {
        req.flash("error_msg", "Error ao deletar post");
        res.redirect("/admin/postagens");
    });
});

module.exports = router;
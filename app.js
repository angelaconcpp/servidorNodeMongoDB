/*TP 3 - NodeJS: Desarrollar con el mismo equipo del TP anterior el servidor Express que sea capaz de responder 
 las peticiones del cliente Angular que desarrollaron en el TP 2.
Detalle:
+ Base de datos para persistir la informacion
+ Metodos:
para ruta "/libro" GET, GET para uno, POST, DELETE, UPDATE (solo se utiliza para indicar que un libro fue prestado
     o sacarlo de la situacion de prestamo, es decir, solo se tiene que poder modificar el campo lended o prestado, 
     verificar al prestar un libro que ya no se encuentre prestado lo que significa que el lended sea vacio 
     lended = '')
para ruta "/genero" GET, GET para uno, POST
Aclaracion: en ambos POST verificar que ya no exista el dato.
+ Utilizar TRY-CATCH, NO OLVIDAR async-await
*/


var express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

// const uri = "mongodb+srv://dbMaria:<password>@cluster0.3g2az.mongodb.net/<dbname>?retryWrites=true&w=majority";

//dbMaria pxiq13wPK1WoVE9c
const uri = "mongodb+srv://mariabd:mariaMngDb@cluster0.3g2az.mongodb.net/pwitt?retryWrites=true&w=majority";

async function conectar(){
    try{
        await mongoose.connect(uri,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        })
        console.log("Conectado a la Base de datos: mongodb - async ");
    }
    catch(e){
        console.log(e);

    }
}

conectar();
const GeneroSchema = new mongoose.Schema({
    nombre: String,
    deleted: Number
});
 
const GeneroModel = mongoose.model("generos", GeneroSchema);
const LibrosSchema = new mongoose.Schema({
    codigo: String,
    nombre: String,
    autor: String,
    prestado:String,
    genero: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'generos'
    }
})
//Armo el modelo
const LibroModel = mongoose.model("libros",LibrosSchema);
app.get('/generos/:id', async (req, res) =>{
    try{
        let id = req.params.id;
        let respuesta = null;
        respuesta = await GeneroModel.findById(id);
        res.status(200).send(respuesta);
    }
    catch(e){
        console.log("error",e);
        res.status(422).send(e);
    }
})
//
app.get('/generos', async (req, res) =>{
    try{
        
        let respuesta = null;
        respuesta = await GeneroModel.find({deleted:0});
        res.status(200).send(respuesta);
    }
    catch(e){
        console.log("error",e);
        res.status(422).send(e);
    }
})
//
app.post('/generos', async (req, res) =>{
    try{
        let nombre = req.body.nombre;
        let deleted = 0;
        if (nombre == undefined){
            throw new Error("Debes ingresar un nombre");
        };
        if (nombre == ""){
            throw new Error("El nombre no puede ser vacio");
        };
        let existeNombre  = null;
        existeNombre = await GeneroModel.find({nombre:nombre});
        if (existeNombre.length > 0){
            throw new Error("ese genero ya existe");
        };
        let genero = {
            nombre: nombre.toUpperCase(),
            deleted: deleted
        }
        await GeneroModel.create(genero);
        res.status(200).send(genero);
    }
    catch(e){
        console.log("error",e);
        res.status(422).send(e);
    }
})
//
app.put('/generos/:id', async (req, res) =>{
    try{
        let nombre = req.body.nombre;
        let id = req.params.id;
        if (nombre == undefined){
            throw new Error("Debes ingresar un nombre");
        };
        if (nombre == ""){
            throw new Error("El nombre no puede ser vacio");
        };
        let existeGenero  = null;
        existeGenero = await GeneroModel.find({nombre:nombre});
        if (existeGenero.length > 0){
            existeGenero.forEach(item => {
                if (item.id == id){
                    throw new Error("ese genero ya existe");
                }
            })
           
        };
        let librosConEseGenero = null;
        librosConEseGenero = await LibroModel.find({"genero":id});
        if(librosConEseGenero.length > 0){
            throw new Error("No se puede modificar, hay libros asociados");
        };
        let generoModificado = {
            nombre:nombre
        }
        await GeneroModel.findByIdAndUpdate(id,generoModificado);
        res.status(200).send(generoModificado);
   
    }
    catch(e){
        console.log("error",e);
        res.status(422).send(e);
    }
})
//
app.delete('/genero/:id', async (req, res) =>{
    try{
        let id = req.params.id;
        
        let generoGuardado = await GeneroModel.findById(id);
        generoGuardado.deleted = 1;
        await GeneroModel.findByIdAndUpdate(id, generoGuardado);
        res.status(200).send({"message": "ok"});
    }
    catch(e){
        console.log("error",e);
        res.status(422).send(e);
    }
})

//post 
app.post('/libros', async (req, res) => {
    try{
        //verificar info recibida
        // let nombre = req.body.nombre;
        // let autor = req.body.autor;
        // let genero = req.body.genero;
        let prestado = req.body.prestado;
        let codigo = req.body.codigo;
        if (codigo == undefined){
            throw new Error("No esta definido el codigo");
        };
         if (codigo ==""){
            throw new Error("Debe ingresar un valor en codigo");
        };
        if (nombre == undefined){
            throw new Error("No esta definido el nombre");
        };
        if (nombre ==""){
            throw new Error("Debe ingresar un valor en nombre");
        };
        if (autor == undefined){
            throw new Error("No esta definido el autor");
        };
        if (autor ==""){
            throw new Error("Debe ingresar un valor en autor");
        };
        if (genero == undefined){
            throw new Error("No esta definido el genero");
        };
        if (genero ==""){
            throw new Error("Debe ingresar un valor en genero");
        };
        let existeGenero = await GeneroModel.findById({_id:genero});
        if(!existeGenero){
            throw new Error("El genero no Existe - Debe crear primero");
        }
        
        if (prestado == undefined){
            throw new Error("No esta definido a quien se presta");
        };
        let libro = {
            codigo:codigo,
            nombre: nombre,
            autor: autor,
            genero: genero.toUpperCase(),
            prestado: prestado
        };
        let elCodigo = parseInt(codigo);
        if (isNaN(elCodigo)){
            throw new Error("El codigo no es un numero");
        };

        let libroExiste = await LibroModel.find({codigo:codigo});
        let personaGuardada = await LibroModel.create(libro);
        console.log(personaGuardada);
        res.status(200).send(personaGuardada);

    }
    catch(e){
        console.log(e);
        res.status(422).send(e);

    }

});
app.get("/libros",async(req, res)=>{
    try{
        listaLibros = await LibroModel.find();
        res.status(200).send(listaLibros);

    }
    catch(e){
        console.log("Error:"+e);
        res.status(422).send(e);
    }
})
/// get por id
app.get("/libros/:id", async(req, res) =>{
    try{
        let libroBuscado = await LibroModel.findById(req.params.id);
        res.status(200).send(libroBuscado);

    }
    catch(e){
        console.log("error: ",e);
        res.status(422).send(e);
    }
}
)
// delete
app.delete("/libros/:id", async (req,res) =>{
    try{
        let id = req.params.id;
        await LibroModel.findByIdAndDelete(id);
        res.status(200).send({message : "Se borro correctamente"});
    }
    catch(e){
        console.log("error",e);
        res.status(422).send(e);
    }
});

app.put("/libros/:id",async (req, res)=>{
    try{
        // let nombre = req.body.nombre;
        // let autor = req.body.autor;
        // let genero = req.body.genero;
        let prestado = req.body.prestado;
        // let codigo = req.body.codigo;
        // if (codigo == undefined){
        //     throw new Error("No esta definido el codigo");
        // };
        // if (codigo ==""){
        //     throw new Error("Debe ingresar un valor en codigo");
        // };
        // if (nombre == undefined){
        //     throw new Error("No esta definido el nombre");
        // };
        // if (nombre ==""){
        //     throw new Error("Debe ingresar un valor en nombre");
        // };
        // if (autor == undefined){
        //     throw new Error("No esta definido el autor");
        // };
        // if (autor ==""){
        //     throw new Error("Debe ingresar un valor en autor");
        // };
        // if (genero == undefined){
        //     throw new Error("No esta definido el genero");
        // };
        // if (genero ==""){
        //     throw new Error("Debe ingresar un valor en genero");
        // };
        if (prestado == undefined){
            throw new Error("No esta definido a quien se presta");
        };

        let elLibro = {
            codigo:codigo,
            nombre: nombre,
            autor: autor,
            genero: genero,
            prestado: prestado
        };

        let libroModificado = await LibroModel.findByIdAndUpdate(req.params.id, elLibro);
        console.log(elLibro);
        res.status(200).send(libroModificado);
    }
    catch(e){
        console.log("error",e);
        res.status(422).send(e);
    }
}
)
var libros =[];

// var libros=[
//     {
//         id : "cod1",
//         nombre : "Caperucita",
//         autor: "Autor 1",
//         prestado : "",
//         genero: "aventura"
//     },
//     {
//         id : "cod2",
//         nombre : "Cenicienta",
//         autor: "Autor 2",
//         prestado : "",
//         genero: "aventura"
//     }
// ];

// app.get('/libro', (req, res)=>{
//     try{
//         // res.status(200).send("Libro OK");
//         res.status(200).send("Libro OK  "+ libros[0].id + " -  "+libros[1].id);
//     }
//     catch(e){
//         res.status(400).send("Libros hubo un error: "+e);
//     }
// });
// //get por id de libro
// app.get('/libro/:id', (req, res) => {
//     try{
//         var id = req.params.id;
//         if (id == undefined) {
//             throw new  Error("id es indefinida");
//         }
//         var indice = libros.findIndex(item => item.id.includes(id));
//         if (indice == -1){
//             throw new  Error("No existe ese libro!!");
//         };
//         var obra = libros[indice].nombre;
//         var genero = libros[indice].genero.
//         res.status(200).send("El ID es: "+id +" - Libro: "+obra+ " - Genero: "+ genero);
//         // res.status(200).send("El ID es: "+id);

//     }
//     catch(e){
//         res.status(400).send("Libros -> hubo un error: "+e);
//     }
// });
app.post('/libro', async (req, res) => {
    try{
        var nombre = req.body.name;
        var autor = req.body.author;
        var prestado = req.body.lended;
        var genero = req.body.gender; 

        if (nombre == undefined) {
            throw new  Error("Falta Nombre");
        }
        if (autor == undefined) {
            throw new  Error("Falta autor");
        }
        if (prestado == undefined) {
            throw new  Error("Falta destinatario de prestamos");
        }
        if (genero == undefined) {
            throw new  Error("Falta genero de libro");
        }
        if (nombre == "") {
            throw new  Error("No puede estar vacío el campo nombre");
        }
        if (autor == "") {
            throw new  Error("No puede estar vacío el campo autor");
        }
        
        let generoExiste = await GeneroModel.findById({_id:genero});
        if(!generoExiste){
            throw new Error("El genero no Existe");
        }
        var preCodigo = "cod"+nombre;
        
        var elLibro = {
            id : preCodigo,
            nombre : nombre,
            autor: autor,
            prestado : prestado,
            genero: genero
        };
        libros.push(elLibro);
        res.status(200).send("Codigo : " +elLibro.id+ "Libro: "+nombre+ " del autor: "+autor+ "fue cargado con exito");
    }
    catch(e){
        res.status(422).send("hubo error en: "+e);
    }
 
})
// app.put('/persona', async(req,res) => {
//     try{

//     }
// }


app.listen(3000, ()=>{
    console.log("Servidor escuchando");
})


// app.post("/persona", (req, res)=>{
//     try{
//         var nombre = req.body.nombre;
//         var apellido = req.body.apellido;
//         var cuit = req.body.cuit;
//         var dni = req.body.dni;
//         // Que me hayan enviado los datos correctos
//         if(nombre == undefined){
//             throw new Error("Falta nombre");
//         }
//         if(apellido == undefined){
//             throw new Error("Falta apellido");
//         }
//         if(cuit == undefined){
//             throw new Error("Falta cuit");
//         }
//         if(dni == undefined){
//             throw new Error("Falta dni");
//         }
//         // Que ningun dato este vacio
//         if(nombre == ''){
//             throw new Error("No puede ser vacio el nombre");
//         }
//         if(apellido == ''){
//             throw new Error("No puede ser vacio el apellido");
//         }
//         if(cuit == ''){
//             throw new Error("No puede ser vacio el cuit");
//         }
//         if(dni == ''){
//             throw new Error("No puede ser vacio el dni");
//         }
//         // Verifico que cuit contenta dni
//         var dniEnCuit = cuit.slice(2, 8);        
//         var cuitOk = dniEnCuit.includes(dni);
//         if(cuitOk == false){
//             throw new Error("Error en el cuit");
//         }
//         res.status(200).send("Los datos son correctos");
//         var persona = {
//             nombre: nombre,
//             apellido: apellido,
//             cuit: cuit,
//             dni: dni 
//         }
//         personas.push(persona);

const express = require('express');
const path =  require('path');  //Para la ruta de los directorios no importando el SO
const morgan = require('morgan');

const app = express();


//settings
app.set('port', 4000)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'))
//app.engine('html', require('ejs').renderFile); //para que pueda compilar html tambien



//midslewares: acciones que se ejecutan antes de que un usuario cargue la pagina //Bases de datos, etc
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));


// routes
/*app.get('/', (req,res)=>{
    res.render('index.ejs')
});*/
app.use(require('./routes/routes'));


// static files: por si quisieramos imagenes, iconos, etc.
app.use(express.static(path.join(__dirname,'public')));


// listening the server
app.listen(4000, () => {
    console.log('Server NodeJS on port: ', app.get('port'), ' http://localhost:4000/');
});

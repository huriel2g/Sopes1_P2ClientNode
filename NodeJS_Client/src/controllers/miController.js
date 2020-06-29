
// Conexion a MongoDB
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://34.70.138.254:27017/";

// Conexion a Redis
var redis = require('redis');
var client = redis.createClient("http://34.70.138.254"); //creates a new client

const controller = {};

var quantity = [];
var depart = ["Alta Verapaz", "Baja Verapaz", "Chimaltenango", "Chiquimula",
    "El Progreso", "Escuintla", "Guatemala", "Huehuetenango",
    "Izabal", "Jalapa", "Jutiapa", "Peten",
    "Quetzaltenango", "Quiche", "Retalhuleu", "Sacatepequez",
    "San Marcos", "Santa Rosa", "Solola", "Suchitepequez",
    "Totonicapan", "Zacapa"]

controller.CargandoPage = (req, res) => {
    res.render('index.ejs');
}

// 1.TABLA CON TODOS LOS DATOS (MongoDB)
controller.AllData = (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (!err) {
            var dbo = db.db("proyecto2");
            dbo.collection("casos").find().toArray(function (err, result) {
                if (err) throw err;
                console.log(result);
                db.close();
                res.render('alldata.ejs', { data: result });
            });
        } else {
            console.log("No hay data en mongo...!!!");
            res.render('alldata.ejs', { data: [] });
            //res.render('alldata.ejs', { data: [{ "name": "-", "depto": "-", "age": 0, "form": "-", "state": "-" }] });
        }
    });
}

// 2.TOP 3 DE DEPARTAMENTOS CON MAS CASOS (MongoDB)
controller.Top3 = (req, res) => {
    for (let x = 0; x < depart.length; x++) {
        if (x == depart.length - 1) {
            redirigirTop(depart[x], res);
        } else {
            addDepto(depart[x]);
        }
    }

}
function redirigirTop(departament, res) {
    MongoClient.connect(url, function (err, db) {
            var dbo = db.db("proyecto2");
            var query = { depto: "" + departament };
            dbo.collection("casos").find(query).count(function (err, result) {
                if (err) throw err;
                db.close();
                var cant = result;
                if (result != 0) {
                    var depto = departament;
                    quantity.push({ depto, cant })
                }
                setTimeout(function () {
                    var top = [];
                    if (quantity.length > 0) {
                        quantity = Burbuja(quantity)
                        top.push(quantity.pop())
                        top.push(quantity.pop())
                        top.push(quantity.pop())
                        //console.log(Burbuja(quantity));   
                    }
                    quantity = []
                    res.render('top3.ejs', { data: top });
                }, 3000);
            });
    });
}
function Burbuja(lista) {
    var n, i, k, aux;
    n = lista.length;
    // Algoritmo de burbuja
    for (k = 1; k < n; k++) {
        for (i = 0; i < (n - k); i++) {
            if (lista[i].cant > lista[i + 1].cant) {
                aux = lista[i];
                lista[i] = lista[i + 1];
                lista[i + 1] = aux;
            }
        }
    }
    return lista;
}

// 3.DEPARTAMENTOS AFECTADOS (MongoDB/Grafica Pie)
controller.Deptos = (req, res) => {
    for (let x = 0; x < depart.length; x++) {
        if (x == depart.length - 1) {
            redirigir(depart[x], res);
        } else {
            addDepto(depart[x]);
        }
    }
}

function addDepto(departament) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("proyecto2");
        var query = { depto: "" + departament };
        dbo.collection("casos").find(query).count(function (err, result) {
            if (err) throw err;
            db.close();
            var a = result;
            //cadenaJson+= '{"rango":'+'"'+rangosEtiq[i]+'",'+'"cant":'+rangos[i]+'}'+coma
            var flag = true;
            if (result != 0) {
                for (let x = 0; x < quantity.length; x++) {
                    if (quantity[x].departament == departament) {
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    var depto = departament;
                    var cant = a;
                    quantity.push({ depto, cant })
                }
            }
        });
    });
}

function redirigir(departament, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("proyecto2");
        var query = { depto: "" + departament };
        dbo.collection("casos").find(query).count(function (err, result) {
            if (err) throw err;
            db.close();
            var cant = result;
            if (result != 0) {
                var depto = departament;
                quantity.push({ depto, cant })
            }
            setTimeout(function () {
                console.log(quantity)
                res.render('deptos.ejs', { data: quantity });
                quantity = []
            }, 3000);
        });
    });
}

// 4.ULTIMO CASO AGREGADO (Redis)
controller.Last = (req, res) => {
    try {
        client.lrange('proyecto2', -1, -1, function (err, result) {
            if(!err){
                var mijson = JSON.parse(result);
                //console.log(mijson)
                res.render('last.ejs', { data: mijson });
            }else{
                console.log("hubo un error")
                res.render('last.ejs', { data: [] });
            }
            
        });    
    } catch (error) {
        res.render('last.ejs', { data: [] });
        //res.render('alldata.ejs', { data: [{ "name": "-", "depto": "-", "age": 0, "form": "-", "state": "-" }] });
    }
    
}

// 5.AFECTADOS POR RANGO DE EDADES (Redis/Grafica de Barras)
controller.AffectedAge = (req, res) => {
    client.lrange('proyecto2', 0, -1, function (err, result) {
        res.render('affected.ejs', { dataQ: tell(result) })
    });
}
function tell(data) {
    var caso = 0;
    var rangosEtiq = [' 0 - 15 ', ' 15 - 30 ', ' 31 - 45 ', ' 46 - 60 ', ' 61 - 75 ', ' 76 - 90 ', ' 91 - 105 ', ' 106 - 120 ', ' 121 - 135 ', ' 136 - 150 ', ' 151 - ∞ ']
    var rangos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    for (let i = 0; i < data.length; i++) {
        caso = JSON.parse(data[i]);
        if (0 < caso.age && caso.age < 10) { rangos[0]++ }
        else if (0 <= caso.age && caso.age <= 15) { rangos[0]++ }
        else if (16 <= caso.age && caso.age <= 30) { rangos[1]++ }
        else if (31 <= caso.age && caso.age <= 45) { rangos[2]++ }
        else if (46 <= caso.age && caso.age <= 60) { rangos[3]++ }
        else if (61 <= caso.age && caso.age <= 75) { rangos[4]++ }
        else if (76 <= caso.age && caso.age <= 90) { rangos[5]++ }
        else if (91 <= caso.age && caso.age <= 105) { rangos[6]++ }
        else if (106 <= caso.age && caso.age <= 120) { rangos[7]++ }
        else if (121 <= caso.age && caso.age <= 135) { rangos[8]++ }
        else if (136 <= caso.age && caso.age <= 150) { rangos[9]++ }
        else if (151 <= caso.age) { rangos[10]++ }
        //console.log(caso.age);
    }
    var dataRange = []
    for (let i = 0; i < 11; i++) {
        var rango = rangosEtiq[i];
        var cant = rangos[i];
        if (cant != 0) {
            dataRange.push({ rango, cant })
        }
    }
    return dataRange;
}


module.exports = controller;
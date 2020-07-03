const express = require('express');
const router = express.Router();
const miController = require('../controllers/miController')

router.get('/delete', miController.Delete);

router.get('/', miController.CargandoPage);

router.get('/alldata', miController.AllData);

router.get('/top3', miController.Top3);

router.get('/deptos', miController.Deptos);

router.get('/last', miController.Last);

router.get('/affected', miController.AffectedAge);





router.get('/about', (req, res) =>{
    res.render('about.ejs')
});




module.exports = router;
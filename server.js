const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const httpPort = 3000;
const saltRounds = 4;
const jwtSecret = 'ef80f12462deeaf80d263cac25fe91d8125b5d4d3e53ce3e';

const app = express();
const userDb = { };

function errCatchHandler(err, req, res, next) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: true, msg: err.message })
}

//lodash function to check if is a string;
function demandString (string) {
    if (!string || Object.prototype.toString.call(string) !== '[object String]') {
        const err = new Error(`Esperado valor em String, obteve ${string}`);
        err.statusCode = 400;
        throw err;
    }
}

//signUp Cadastro
async function signUpHandler(req, res) {
    try {
        const { user, password } = req.body;
        demandString(user);
        demandString(password);
        if (userDb[user]){
            const err = new Error(`O Cadatro de ${user} ja existe no banco`);
            err.statusCode = 400;
            throw err;
        }
        //usando bcrypt para hashear a senha e evitar falhas de segurança, async por conta da execução da operação;
        userDb[user] = {
             hashedPassword: await bcrypt.hash(password, saltRounds)
        };
        const token = jwt.sign({user}, jwtSecret);
        res.status(201).json({ signupSuccess: true, jwt: token})

    } catch (ex) { errCatchHandler(ex, req, res); }
}

//login
async function loginHandler (req, res) {
    try {
        const { user, password } = req.body;
        demandString(user);
        demandString(password);

        if (userDb[user]){
            const err = new Error(`Usuario ${user} nao esta registrado no banco`);
            err.statusCode = 400;
            throw err;
        }

        if (!await bcrypt.compare(password, hashedPassword)){
            const err = new Error(`Senha invalida`);
            err.statusCode = 400;
            throw err;
        }
        
        const token = jwt.sign({user}, jwtSecret);
        res.status(201).json({ loginSuccess: true, jwt: token})
    } catch (ex) { errCatchHandler(ex, req, res); }
}



app.post('/sign-up', bodyParser.json(), signUpHandler);
app.post('/login', bodyParser.json(), loginHandler);


app.use(function (req, res) {
    res.status(404).json({ notFound: true, code: 404 });
});


app.use(errCatchHandler);

app.listen(httpPort, () => {
    console.log(`Server on http://localhost:${httpPort}`);
});
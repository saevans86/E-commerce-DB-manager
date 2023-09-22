const express = require('express');
const routes = require('./routes/api');


const seed = require('./seeds/index');
console.log(seed)


const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);


app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
});

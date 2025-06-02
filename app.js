import express from 'express'

const app = express();

app.get('/', (req, res)=> {
    res.send('Ishaan is gay')
})

app.listen(4000);
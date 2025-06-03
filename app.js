import express from 'express'

const app = express();

app.get('/', (req, res)=> {
    res.send('Ishaan is gay, and he is proud of it!')
})

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/`);
});

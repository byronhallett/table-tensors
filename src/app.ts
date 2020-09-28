import express from 'express'
import { home } from './pages/home'

const app = express()
const port = 1111

app.use(express.static("public"))

app.listen(port, () => console.log(`ML Pong listening at localhost:${port}!`))

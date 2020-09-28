import {RequestHandler} from 'express'
import path from 'path'

export const home: RequestHandler = (req, res) => {
  res.sendFile(path.join(__dirname, "../../templates/home.html"))
}

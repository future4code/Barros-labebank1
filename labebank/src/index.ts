console.log("LabeBank");
import express, {Response, Request} from "express"

import cors from 'cors'

const app = express()

app.use(express.json())

app.use(cors())

app.post('/users/createaccount', (req: Request, res: Response) => {
    try{
       const {name, CPF, birthDate} = req.body
       let checkDate = birthDate.split('-').reverse().join('-')
       let today = Date.now();
       let birth: any = new Date(`${checkDate} 00:00:00`)
       let year = 1000*60*60*24*365
       let age = (today - birth) / year
       age = Math.floor(age)
       
       console.log(age)
       res.status(200).send(age);
       
    }catch(err) {
        res.status(400).send("erro");
    }
});


app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003");
});
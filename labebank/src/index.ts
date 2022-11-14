console.log("LabeBank");
import express, {Response, Request} from "express";
import cors from 'cors';
import {account} from "./data";

const app = express()

app.use(express.json())

app.use(cors())

app.post('/users/createaccount', (req: Request, res: Response) => {
    let errorCode = 400;
    try{
        const {name, CPF, birthDate} = req.body

        if(!name || !CPF || !birthDate) {
         errorCode = 422;
         throw new Error("Obrigatóriamente deve informar: Nome completo, CPF válido e data de nascimento.")
        }
       
       // Cálculo para encontrar a idade a partir da data de nascimento 
       let checkDate = birthDate.split('-').reverse().join('-')
       let birth: any = new Date(`${checkDate} 00:00:00`)
       let year = 1000*60*60*24*365
       let age = Math.floor((Date.now() - birth) / year)

       if (age < 18) {
        errorCode = 403;
        throw new Error("Necessário ter 18 anos completos para abrir uma conta.")
       }

       const searchCPF = account.filter((user) => user.CPF === CPF);

       if (searchCPF.length > 0) {
        errorCode = 409;
        throw new Error("CPF já cadastrado na base de dados. Só é permitido uma conta por CPF.")
       }
       
       account.push({
        name,
        CPF,
        birthDate,
        saldo: 0,
        extrato: []
       })

       res.status(200).send("Conta cadastrada com sucesso!");
       
    }catch(err: any) {
        res.status(errorCode).send(err.message);
    }
});


app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003");
});
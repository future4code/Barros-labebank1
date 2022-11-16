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

       res.status(201).send("Conta cadastrada com sucesso!");
       
    }catch(err: any) {
        res.status(errorCode).send(err.message);
    }
});

app.patch('/users/transfer', (req: Request, res: Response) => {
    let errorCode = 400;
    try {
        const infoTransfer = req.body

        if (!infoTransfer) {
            errorCode = 422
            throw new Error("Deve passar os dados da transferência via body.");
        }

        if (!infoTransfer.payee || !infoTransfer.payee.name || !infoTransfer.payee.CPF) {
            errorCode = 422
            throw new Error("Deve informar nome e CPF do pagador da transferência");
        }
        
        if (!infoTransfer.receiver || !infoTransfer.receiver.name || !infoTransfer.receiver.CPF) {
            errorCode = 422
            throw new Error("Deve informar nome e CPF do recebedor da transferência");
        }

        if (!infoTransfer.value || typeof infoTransfer.value !== "number" || infoTransfer.value <= 0) {
            errorCode = 422
            throw new Error("Deve informar o valor a ser transferido.");
        }

        const indexPayee = account.findIndex(user => user.CPF === infoTransfer.payee.CPF && user.name === infoTransfer.payee.name)
        const indexReceiver = account.findIndex(user => user.CPF === infoTransfer.receiver.CPF && user.name === infoTransfer.receiver.name)

        if (indexPayee < 0) {
            errorCode = 404
            throw new Error("Pagador não encontrado");
        }

        if (indexReceiver < 0) {
            errorCode = 404
            throw new Error("Recebedor não encontrado");
        }

        account[indexPayee].saldo -= infoTransfer.value
        account[indexReceiver].saldo += infoTransfer.value
        
        res.status(201).send(`Transferência de R$ ${infoTransfer.value} enviada com sucesso!`);

    } catch (err: any) {
        res.status(errorCode).send(err.message);
    }
});


app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003");
});
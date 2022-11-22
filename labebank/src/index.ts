console.log("LabeBank");
import express, { Response, Request } from "express";
import cors from 'cors';
import { account } from "./data";

const app = express()

app.use(express.json())

app.use(cors())
//Criar conta ==>
app.post('/users/createaccount', (req: Request, res: Response) => {
    let errorCode = 400;
    try {
        const { name, CPF, birthDate } = req.body

        if (!name || !CPF || !birthDate) {
            errorCode = 422;
            throw new Error("Obrigatóriamente deve informar: Nome completo, CPF válido e data de nascimento.")
        }

        // Cálculo para encontrar a idade a partir da data de nascimento 
        let checkDate = birthDate.split('-').reverse().join('-')
        let birth: any = new Date(`${checkDate} 00:00:00`)
        let year = 1000 * 60 * 60 * 24 * 365
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

    } catch (err: any) {
        res.status(errorCode).send(err.message);
    }
});
// Transferência Interna ==>
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

//Buscar todos Usuarios ===>
app.get("/users", (req: Request, resp: Response) => {
    let errorCode = 400;
    try {
        resp.status(200).send(account)

    } catch (err: any) {
        resp.status(errorCode).send(err.message)
    }

})

//Pegar Saldo ==>

app.get("/user/balance", (req: Request, resp: Response) => {
    let errorCode = 400;
    try {
        const { name } = req.body
        const { CPF } = req.body

        let balanceUser
        if (!name || !CPF) {
            errorCode = 422;
            throw new Error("Não foi passado o body corretamente");
        }
        const balance = account.filter((user) => {
            if (user.CPF === CPF && user.name.toUpperCase() === name.toUpperCase()) {
               return  balanceUser = user.saldo
            }
        }
        )
        if (balance.length === 0) {
            errorCode = 404
            throw new Error("Não encontrado");
        }

        resp.status(200).send(`Seu saldo é de R$: ${balanceUser}`);

    } catch (err: any) {
        resp.status(errorCode).send(err.message)
    }
})

// Pagar conta ==>

app.patch("/users/bill-pay", (req: Request, resp: Response) => {
    let errorCode = 400;
    try {
       const { name, CPF, billValue, description, payDate } = req.body

        if (!name) {
            errorCode = 422
            throw new Error("Nome inválido.");
        }

        if (!CPF) {
            errorCode = 422
            throw new Error("CPF inválido.");
        }

       if (!billValue) {
            errorCode = 422
            throw new Error("Valor inválido.");
        }

        if (!description) {
            errorCode = 422
            throw new Error("Descrição inválida.");
        }

        let transferDate = payDate

        if (!payDate) {
            transferDate = Date.now()
        } else {

            // Cálculo para saber se a data ja passou

            let checkDate = transferDate.split('-').reverse().join('-')
            let transfer: any = new Date(`${checkDate} 00:00:00`)
            let validData = Math.floor(Date.now() - transfer)

            if (validData > 0) {
                errorCode = 403;
                throw new Error("Data inválida, insira uma que seja no futuro.")
            }

        }

        // Cálculo para saber se há débito na conta

        const indexPayeeBill = account.findIndex(user => user.CPF === CPF && user.name === name)

        if (indexPayeeBill < 0) {
            errorCode = 404
            throw new Error("Pagador não encontrado");
        }

        if (account[indexPayeeBill].saldo < billValue) {
            errorCode = 409;
            throw new Error("Valor a ser pago da conta acima do saldo disponível.")
        };

        account[indexPayeeBill].saldo -= billValue

        resp.status(200).send(`Débito de ${description} no valor ${billValue} será efetuado na data ${transferDate}.`);

    } catch (err: any) {
        resp.status(errorCode).send(err.message)
    }

})


// Adicionar Saldo ===>

app.put("/adicionar/saldo", (req: express.Request, resp: express.Response) => {
    const {name,CPF, newBalance} = req.body;
    let errorCode = 400;
    let balance
     
    try{
        if (!name) {
            errorCode = 422;
            throw new Error("Não possui parametro name!");
        }
        if (!CPF) {
            errorCode = 422;
            throw new Error("Não possui parametro CPF!");
        }
        if (!newBalance) {
            errorCode = 422;
            throw new Error("Não possui parametro newBalance!");
        }
        const searchUser = account.filter((user) => {
            if(user.CPF === CPF){
               balance = user.saldo + newBalance  
             return  user.saldo = balance
            }
        });

       if(searchUser.length == 0){
        errorCode = 422;
          throw new Error("Não possui esse usuario");
       }

        resp.status(201).send(`Seu saldo atualizado é de ${balance}`);
      
    }catch(erro:any){
        resp.status(errorCode).send(erro.message)
    }
})

app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003");
});
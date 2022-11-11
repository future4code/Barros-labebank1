import { userTypes, Extrato } from './type'

export const account: userTypes[] = [
    {
        name: "Camila Teixeira",
        CPF: 11122233384,
        birthDate: "11-02-1980",
        saldo: 19000,
        extrato: [
            { valor: 190, date: "10-02-2022", descricao: "despesa gatos" },
            { valor: 250, date: "10-10-2022", descricao: "cabelo, unha" }
        ]
    },
    {
        name: "Rodrigo Grande do Sul",
        CPF: 22233344410,
        birthDate: "20-07-1990",
        saldo: 25000,
        extrato: [
            { valor: 390, date: "10-08-2021", descricao: "free fire " },
            { valor: 450, date: "18-1-2022", descricao: "churrasco no juninho" },
            { valor: 260, date: "9-4-2022", descricao: "aniversario Ana" },
        ]
    },
    {
        name: "Joana Pao e Vinho",
        CPF: 11122255578,
        birthDate: "06-04-1984",
        saldo: 2000,
        extrato: [
            { valor: 19, date: "31-12-20221", descricao: "blusinha" },
            { valor: 350, date: "31-12-2021", descricao: "bebida ano novo" },
            { valor: 600, date: "10-01-2022", descricao: "aluguel" }
        ]
    },
]
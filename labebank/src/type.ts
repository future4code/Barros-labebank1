export type userTypes = {
    name : string,
    CPF: number,
    birthDate: string,
    saldo: number,
    extrato: Extrato[]
}

export type Extrato = {
    valor: number,
    date: string,
    descricao: string
}
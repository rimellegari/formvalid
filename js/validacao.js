// const dataNascimento = document.getElementById('nascimento');

// dataNascimento.addEventListener('blur',(evento)=>{
//     validaDN(evento.target);
// })


//criando função para utilizar os data-types

export function valida(input) {
    const tipoInput = input.dataset.tipo;

    if(validadores[tipoInput]) {
        validadores[tipoInput](input)
    }
//inputs tem diversos objetos, entre elas validity que retorna as propriedades referentes a campo e seu preenchimento
//para esse caso vamos verificar se a validty é true or false 

    if(input.validity.valid){
        input.parentElement.classList.remove('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML=""

    } else {
        input.parentElement.classList.add('input-container--invalido');
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML= MostraMsgErro(tipoInput,input);
        
    }

}

//criando array com tipo de erro para fazer check das mensagens

const tiposErros = [
    'valueMissing',
    'typeMismatch',
    'patternMismatch',
    'customError',
]

//criando objeto para agrupar mensagens para cada campo do form

const msgErro = {

    nome: {
        valueMissing: 'O campo nome não pode estar vazio.'
    },
    email: {
        valueMissing: 'O campo nome não pode estar vazio.',
        typeMismatch: 'O email digitado não é válido',
    },

    senha: {
        valueMissing: 'O campo senha não pode estar vazio',
        patternMismatch: 'A senha deve ter entre 6 e 12 caracteres, 1 letra maiúscula, 1 letra minúscula, números e sem caracteres especiais'

    },

    dataDN: {
        valueMissing: 'O campo data de nascimento não pode estar vazio',
        customError:'Você deve ter 18 anos ou mais para se cadastrar.'
    },

    cpf: {
        valueMissing: 'O campo senha não pode estar vazio',
        customError:'O CPF digitado não é valido'
    },

    cep: {
        valueMissing: 'O campo de CPF não pode estar vazio',
        patternMismatch: 'O CPF digitado não é válido',
        customError: 'Não foi possível buscar o CEP'
    },

    logradouro: {
        valueMissing: 'O campo de logradouro não pode estar vazio'
    },

    cidade: {
        valueMissing: 'O campo de cidade não pode estar vazio'
    },

    estado: {
        valueMissing: 'O campo de estado não pode estar vazio'
    },
    preco: {
        valueMissing: 'O campo de preço não pode estar vazio'
    }


    
}

const validadores = {
    dataDN:input => validaDN(input),
    cpf:input=>validaCPF(input),
    cep:input=> recuperarCEP(input)
}

function MostraMsgErro(tipoInput, input) {
    let mensagem = '';

    tiposErros.forEach(erro => {
        if(input.validity[erro]) {
            mensagem = msgErro[tipoInput][erro] //atualizar mensagem para o tipo de erro que retornar com a verificação e trazer a msg correspondente
        }
    })

    return mensagem
}


function validaDN(input) {
    const dataRecebida = new Date(input.value);
    let mensagem = '';

    if(!MaiordeIdade(dataRecebida)) {
        mensagem = 'Você deve ter 18 anos ou mais para se cadastrar.'
    }


    input.setCustomValidity(mensagem);
}


function MaiordeIdade(data)  {
    const dataAtual = new Date() //o uso de new date sem parâmetros traz a data de hoje
    //somando 18 anos à data do input
    const dataMais18 = new Date(data.getUTCFullYear()+18, data.getUTCMonth(), data.getUTCDate())

    return dataMais18 <= dataAtual

}

//cpf

function validaCPF(input) {
    const cpfformatado = input.value.replace(/\D/g,'')
    let mensagem ='';

    if(!onzeDigCPF(cpfformatado) || !checaEstuturaCPF(cpfformatado)) {
        mensagem = 'O CPF digitado não é valido'
    }

    input.setCustomValidity(mensagem)
}

function onzeDigCPF(cpf) {
    const valoresRepetidos = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999'
    ]

    let cpfValido = true

    valoresRepetidos.forEach(valor => {
        if(valor ==cpf) {
            cpfValido = false
        }

    })
        return cpfValido
    
}

//Validação todos os numeros CPF

function checaEstuturaCPF(cpf) {
    const multiplicador = 10

    return checaDigitoVerificador(cpf, multiplicador) 
    
}

function checaDigitoVerificador(cpf, multiplicador) {
    if(multiplicador>=12) {
        return true
    }

//constante para armazenar soma dos 9 primeiros digitos - função substring para cortar o cpf
    let multiplicadorInicial = multiplicador
    let soma = 0
    const cpfSemDigitos = cpf.substr(0,multiplicador-1).split('')
    const digitoVerificador = cpf.charAt(multiplicador-1)
    for(let contador = 0; multiplicadorInicial >1; multiplicadorInicial--) {
        soma = soma +cpfSemDigitos[contador]*multiplicadorInicial
        contador++
    }
    if(digitoVerificador ==confirmaDigito(soma)) {
        return checaDigitoVerificador(cpf, multiplicador+1)
    }
    return false
}
function confirmaDigito(soma) {
    return 11 - (soma % 11)
}

//CEP
function recuperarCEP(input) {
const cep = input.value.replace(/\D/g,'')
//criando url cep
const url = `https://viacep.com.br/ws/${cep}/json/`
//requisição
const options = {
    method:'GET',
    mode: 'cors',
    headers: {
        'content-type': 'application/json;charset=utf-8'
    }

}
    //validando input antes da requisição
    if(!input.validity.patternMismatch && !input.validity.valueMissing) {
        fetch(url,options).then(
            //convertendo resposta em json
            response => response.json()
        ).then(
            data=> {
                //checando erroTrue
                if(data.erro) {
                    input.setCustomValidity('Não foi possível buscar o CEP')
                    return
                }
                input.setCustomValidity('');
                preencheCampos(data)
                return
            }
        )
            

    }
}

function preencheCampos(data) {
    const logradouro = document.querySelector('[data-tipo="logradouro"]');
    const cidade = document.querySelector('[data-tipo="cidade"]');
    const estado = document.querySelector('[data-tipo="estado"]');

    logradouro.value=data.logradouro;
    cidade.value = data.localidade;
    estado.value = data.uf;
}
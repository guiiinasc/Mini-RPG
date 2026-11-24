// VARIÁVEIS DO JOGADOR
let playerName = ""
let vida = 100
let vidaJacare = 125
let vidaTungSahur = 110
let vidaMorcego = 100
let vidaCavaleiro = 130
let pocoes = 2
let furia = 0
let nomeInimigoAtual = ""
let vidaInimigoAtual = 0
let vidaMaximaInimigoAtual = 0 
let resolverBatalha = null

// ========== CAIXA DE TEXTO ==========

// MOSTRA UM TEXTO COM BOTÕES E ESPERA O JOGADOR CLICAR EM UM.
// Devolve o texto do botão que foi clicado.
function escolher(texto, opcoes) {
    document.getElementById("texto").textContent = texto
    let areaOpcoes = document.getElementById("opcoes")
    areaOpcoes.innerHTML = ""

    return new Promise(resolve => {
        for (let i = 0; i < opcoes.length; i++) {
            let botao = document.createElement("button")
            botao.textContent = opcoes[i]
            botao.addEventListener("click", function () {
                areaOpcoes.innerHTML = ""
                resolve(opcoes[i])
            })
            areaOpcoes.appendChild(botao)
        }
    })
}

// MOSTRA UMA MENSAGEM E ESPERA O JOGADOR CLICAR EM "CONTINUAR"
function mostrarMensagem(texto) {
    return escolher(texto, ["Continuar"])
}

// ========== BATALHA ==========

// TRAVAR (true) OU DESTRAVAR (false) OS BOTÕES DA BATALHA
function travarBotoes(travar) {
    document.getElementById("btnAtacar").disabled = travar
    document.getElementById("btnPoder").disabled = travar
    document.getElementById("btnPocao").disabled = travar
}

// VEZ DO JOGADOR ESCOLHER UMA AÇÃO
function vezDoJogador() {
    document.getElementById("texto").textContent = "O que " + playerName + " vai fazer?"
    document.getElementById("opcoes").innerHTML = ""
    travarBotoes(false)
}

// RECEBER DANO
async function receberDano() {
    let dano = Math.floor(Math.random() * 11) + 10
    vida -= dano
    let vlFuria = Math.floor(dano / 1.5)
    furia += vlFuria
    if (furia > 50) {
        furia = 50
    }
    if (vida < 0) {
        vida = 0
    }
    atualizarInterface()
    await mostrarMensagem(nomeInimigoAtual + " atacou!\nVocê recebeu " + dano + " de dano!")
}

// VERIFICAR VIDA DO JOGADOR
async function verificarVida() {
    if (vida <= 0) {
        document.getElementById("fotoJogador").src = "img/morto.svg"
        await mostrarMensagem("Você perdeu!")

        return false
    } else {
        return true
    }
}

// ATACAR INIMIGO
async function atacarInimigo(nomeInimigo, vidaInimigo) {
    let dano = Math.floor(Math.random() * 16) + 10
    let critico = false
    if (Math.random() < 0.2) {
        dano += dano
        critico = true
    }

    vidaInimigo = Math.max(0, vidaInimigo - dano)
    document.getElementById("vidaInimigo").textContent = vidaInimigo
    document.getElementById("barraVidaInimigo").style.width =
        (vidaInimigo / vidaMaximaInimigoAtual) * 100 + "%"
    if (critico === true) {
        await mostrarMensagem("GOLPE CRÍTICO! Você atacou " + nomeInimigo + " e causou " + dano + " de dano!")
    } else{
        await mostrarMensagem("Você atacou " + nomeInimigo + " e causou " + dano + " de dano!")
    }
    return vidaInimigo
}

// COMBATER INIMIGO
async function combaterInimigo(nomeInimigo, vidaInimigo) {

    nomeInimigoAtual = nomeInimigo
    vidaInimigoAtual = vidaInimigo
    vidaMaximaInimigoAtual = vidaInimigo

    document.getElementById("telaBatalha").hidden = false
    document.getElementById("acoesBatalha").hidden = false

    document.getElementById("nomeInimigo").textContent = nomeInimigo
    document.getElementById("vidaInimigo").textContent = vidaInimigo
    document.getElementById("vidaMaximaInimigo").textContent = vidaInimigo

    document.getElementById("barraVidaInimigo").style.width = "100%"

    atualizarInterface()

    // IMAGEM DO INIMIGO
    if (nomeInimigo === "Tung Sahur") {
        document.getElementById("fotoInimigo").src = "img/tungsahur.svg"
    } else if(nomeInimigo === "Jacaré de 3 metros"){
        document.getElementById("fotoInimigo").src = "img/jacare.svg"
    } else if(nomeInimigo === "Cavaleiro"){
        document.getElementById("fotoInimigo").src = "img/cavaleiro.svg"
    } else {
        document.getElementById("fotoInimigo").src = "img/morcego.svg"
    }

    vezDoJogador()
    document.getElementById("texto").textContent =
        nomeInimigo + " apareceu! O que " + playerName + " vai fazer?"

    // Aguarda o jogador vencer ou perder
    return new Promise(resolve => {
        resolverBatalha = resolve
    })
}

// FINALIZAR BATALHA
function finalizarBatalha() {

    document.getElementById("telaBatalha").hidden = true
    document.getElementById("acoesBatalha").hidden = true

    let resolver = resolverBatalha
    resolverBatalha = null

    if (resolver) {
        resolver(vidaInimigoAtual)
    }
}

// TURNO DO INIMIGO
async function turnoInimigo() {

    if (vidaInimigoAtual <= 0 || vida <= 0) {
        return
    }

    await receberDano()

    if (vida <= 0) {
        await verificarVida()
        finalizarBatalha()
    }
}

// USAR POÇÃO
async function usarPocao() {
    if (pocoes > 0 && vida < 100) {
        vida += 30
        if (vida > 100) {
            vida = 100
        }
        pocoes--
        atualizarInterface()
        await mostrarMensagem("Você usou uma poção e recuperou vida!\nPoções restantes: " + pocoes)
        return true
    } else if (pocoes <= 0) {
        await mostrarMensagem("Você não possui mais poções!")
        return false
    } else {
        await mostrarMensagem("Sua vida já está cheia!")
        return false
    }
}

// FURIA
async function usarPoder() {
    if (furia >= 50) {
        let dano = Math.floor(Math.random() * 31) + 50
        vidaInimigoAtual = Math.max(0, vidaInimigoAtual - dano)
        document.getElementById("vidaInimigo").textContent = vidaInimigoAtual
        document.getElementById("barraVidaInimigo").style.width =
            (vidaInimigoAtual / vidaMaximaInimigoAtual) * 100 + "%"
        furia = 0
        atualizarInterface()
        await mostrarMensagem("FÚRIA ATIVADA! Você atacou " + nomeInimigoAtual + " e causou " + dano + " de dano!")
        return true
    } else {
        let faltaFuria = 50 - furia
        await mostrarMensagem("Sua fúria ainda não está cheia! Falta " + faltaFuria + " de fúria.")
        return false
    }
}

// ATUALIZAR INTERFACE
function atualizarInterface() {

    document.getElementById("vidaJogador").textContent = vida
    document.getElementById("pocoesJogador").textContent = pocoes
    document.getElementById("furiaJogador").textContent = furia

    document.getElementById("barraVidaJogador").style.width = vida + "%"
    document.getElementById("barraFuriaJogador").style.width = (furia / 50) * 100 + "%"
}

// EVENTOS DOS BOTÕES
let botaoAtacar = document.getElementById("btnAtacar")
botaoAtacar.addEventListener("click", async function () {
    console.log("Botão Atacar clicado!")
    if (resolverBatalha === null) {
        return
    }
    travarBotoes(true)
    vidaInimigoAtual = await atacarInimigo(
        nomeInimigoAtual,
        vidaInimigoAtual
    )
    if (vidaInimigoAtual <= 0) {
        document.getElementById("fotoInimigo").src = "img/morto.svg"
        await mostrarMensagem("Parabéns! Você derrotou " + nomeInimigoAtual + "!")
        finalizarBatalha()
    } else {
        await turnoInimigo()
    }
    // Se a batalha ainda não acabou, volta a ser a vez do jogador
    if (resolverBatalha !== null) {
        vezDoJogador()
    }
})

let botaoPocao = document.getElementById("btnPocao")
botaoPocao.addEventListener("click", async function () {
    console.log("botao cricado")
    if (resolverBatalha === null) {
        return
    }
    travarBotoes(true)
    let curou = await usarPocao()
    if (curou === true) {
        await turnoInimigo()
    }
    if (resolverBatalha !== null) {
        vezDoJogador()
    }
})

let botaoPoder = document.getElementById("btnPoder")
botaoPoder.addEventListener("click", async function () {
    console.log("Botao poder foi clicado")
    if (resolverBatalha === null) {
        return
    }
    travarBotoes(true)
    let poder = await usarPoder()
    if (poder === true) {
        if (vidaInimigoAtual <= 0) {
            document.getElementById("fotoInimigo").src = "img/morto.svg"
            await mostrarMensagem("Parabéns! Você derrotou " + nomeInimigoAtual + "!")
            finalizarBatalha()
        } else {
            await turnoInimigo()
        }
    }
    if (resolverBatalha !== null) {
        vezDoJogador()
    }
})

// BOTÃO COMEÇAR (tela inicial)
let botaoComecar = document.getElementById("btnComecar")
botaoComecar.addEventListener("click", function () {
    playerName = document.getElementById("campoNome").value
    if (playerName === "") {
        playerName = "Aventureiro"
    }
    document.getElementById("playerName").textContent = playerName
    document.getElementById("telaInicio").hidden = true
    document.getElementById("caixaTexto").hidden = false
    iniciarAventura()
})


// INICIAR AVENTURA
async function iniciarAventura() {
    await mostrarMensagem("Bem vindo " + playerName + " à aventura do JavaScript!")
    await mostrarMensagem("Seu personagem é um aventureiro que recebeu uma missão: encontrar um reino perdido que desapareceu há centenas de anos.")
    await mostrarMensagem("Esse Mini Game é baseado em escolhas, você terá que tomar decisões para conseguir chegar ao reino perdido.")

    let escolha1 = await escolher("Você aceita a missão de encontrar o Reino Perdido?", ["Sim", "Não"])
    if (escolha1 === "Sim") {
        await mostrarMensagem("Você aceitou a missão! Vamos começar a jornada.")
    } else if (escolha1 === "Não") {
        await mostrarMensagem("Você hesitou, mas a missão precisa ser cumprida. Sua aventura começa agora!")
    }

    let escolha2 = await escolher("Você está em uma floresta densa e encontra um caminho bifurcado. Qual caminho você segue?", ["Esquerda", "Direita"])
    if (escolha2 === "Esquerda") {
        await mostrarMensagem("Você seguiu o caminho da esquerda e encontrou um rio. Você precisa atravessar o rio para continuar sua jornada.")

        let escolha3 = await escolher("Você encontra uma ponte instável. Você decide atravessar a ponte ou procurar outro caminho?", ["Atravessar", "Procurar"])
        if (escolha3 === "Atravessar") {
            await mostrarMensagem("Você caiu na água e a correnteza te levou para longe. Infelizmente, você não conseguiu completar a missão. Fim de Jogo.")
        } else if (escolha3 === "Procurar") {
            await mostrarMensagem("Você encontrou um caminho alternativo e conseguiu atravessar o rio com segurança. Parabéns! Você continuou sua jornada em busca do Reino Perdido.")

            let escolha5 = await escolher("Após atravessar o rio, você encontra um castelo abandonado. Deseja entrar para investigar?", ["Sim", "Não"])
            if (escolha5 === "Sim") {
                await mostrarMensagem("Você entra no castelo abandonado. Os corredores estão escuros e silenciosos... De repente, um Cavaleiro Fantasma surge das sombras e bloqueia a passagem!")
                vidaCavaleiro = await combaterInimigo("Cavaleiro", vidaCavaleiro)
                if(vida > 0){
                    await mostrarMensagem("O Cavaleiro Fantasma desaparece no ar. Atrás dele, você encontra uma passagem secreta que leva diretamente ao Reino Perdido. Parabéns, você completou sua missão!")
                } else{
                    await mostrarMensagem("O Cavaleiro Fantasma era forte demais. Sem forças para continuar, sua jornada termina nos corredores do castelo. Fim de jogo!")
                }
            } else if (escolha5 === "Não") {
                await mostrarMensagem("Você decide continuar pela floresta, mas acaba se deparando com um Tung Tung Sahur maligno!")
                vidaTungSahur = await combaterInimigo("Tung Sahur", vidaTungSahur)
                if (vida > 0) {
                    await mostrarMensagem("Após derrotar o Tung Sahur, você encontra uma passagem escondida que leva a uma antiga vila.")
                   
                    let escolhaFinal1 = await escolher("Você deseja seguir para a vila ou explorar uma torre misteriosa?", ["Vila", "Torre"])
                    if (escolhaFinal1 === "Vila") {
                        await mostrarMensagem("Você chega à vila e descobre que os moradores conhecem a localização do Reino Perdido. Eles mostram o caminho e você finalmente completa sua missão! Parabéns!")
                    } else {
                        await mostrarMensagem("Você explora a torre e encontra um mapa antigo que revela a localização do Reino Perdido. Com o mapa em mãos, você encontra o reino e conclui sua aventura com sucesso!")
                    }
                } else {
                    await mostrarMensagem("Você foi derrotado pelo Tung Sahur. Sem forças para continuar, sua jornada termina na floresta. Fim de jogo!")
                }
            }
        }

    } else if (escolha2 === "Direita") {
        await mostrarMensagem("Você seguiu o caminho da direita e encontrou uma caverna escura. Você precisa decidir se entra na caverna ou procura outro caminho.")

        let escolha4 = await escolher("Você decide entrar na caverna?", ["Sim", "Não"])
        if (escolha4 === "Sim") {
            await mostrarMensagem("Você decide entrar na caverna escura. No fundo, algo brilha: um tesouro! Mas, antes que você chegue perto, um Morcego Gigante desce do teto e parte para cima de você!")
            vidaMorcego = await combaterInimigo("Morcego", vidaMorcego)
            if(vida > 0){
                await mostrarMensagem("O Morcego Gigante foge voando pela escuridão. Você pega o tesouro e, atrás dele, descobre a entrada do Reino Perdido. Parabéns, você completou sua missão com sucesso!")
            } else{
                await mostrarMensagem("O Morcego Gigante foi rápido demais para você. Ferido e sem forças, você não consegue sair da caverna. Fim de jogo!")
            }
        } else if (escolha4 === "Não") {
            await mostrarMensagem("Você decide não entrar na caverna e continuar sua jornada, porém no caminho encontrou com um jacaré de 3 METROS!")
            vidaJacare = await combaterInimigo("Jacaré de 3 metros", vidaJacare)
            if (vida > 0) {
                await mostrarMensagem("Você conseguiu derrotar o jacaré e sobreviveu ao encontro!")
                await mostrarMensagem("Após a batalha, você percebe duas passagens no fundo da caverna.")

                let escolhaFinal2 = await escolher("Você deseja seguir por uma passagem iluminada ou por um túnel escuro?", ["Iluminada", "Escuro"])
                if (escolhaFinal2 === "Iluminada") {
                    await mostrarMensagem("Você segue pela passagem iluminada e encontra uma enorme sala cheia de tesouros. No centro dela está a entrada do Reino Perdido! Você conseguiu completar sua missão!")
                } else {
                    await mostrarMensagem("Você atravessa o túnel escuro e encontra uma saída secreta que leva diretamente ao Reino Perdido. Depois de tantos desafios, sua aventura finalmente termina com sucesso!")
                }
            } else {
                await mostrarMensagem("O jacaré foi mais forte do que você imaginava. Ferido e sem forças, você não consegue escapar da caverna. Fim de jogo!")
            }
        }
    }

    await escolher("Obrigado por jogar, " + playerName + "!", ["Jogar de novo "])
    location.reload()
}

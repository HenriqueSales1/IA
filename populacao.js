const readline = require('readline');

const moedas = [20, 11, 5, 1];
const tamanho_pop = 50;
const max_geracoes = 300;
const taxa_mutacao = 0.1;

class Individuo {
    constructor() {
        this.genes = moedas.map(() => Math.floor(Math.random() * 6));
        this.nota = 9999;
        this.valorTotal = 0;
    }

    avaliarNota(alvo) {
        this.valorTotal = this.genes.reduce((soma, gene, i) => soma + (gene * moedas[i]), 0);

        if (alvo === -1) {
            return;
        }

        if (this.valorTotal === alvo) {
            this.nota = this.totalMoedas();
        } else {
            this.nota = 9999;
        }
    }

    totalMoedas() {
        return this.genes.reduce((soma, gene) => soma + gene, 0);
    }
}

function cruzamento(pai1, pai2) {
    const filho = new Individuo();
    filho.genes = pai1.genes.map((genePai1, index) => {
        const genePai2 = pai2.genes[index];
        return Math.random() < 0.5 ? genePai1 : genePai2;
    });
    return filho;
}

function mutacao(ind) {
    for (let i = 0; i < moedas.length; i++) {
        if (Math.random() < taxa_mutacao) {
            ind.genes[i] = Math.floor(Math.random() * 6);
        }
    }
}

function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("Digite o valor do troco (ex. 260 para R$2,60): ", (valorInput) => {
        const valor = parseInt(valorInput, 10);
        
        if (isNaN(valor) || valor < 0) {
            console.error("Valor inválido.");
            rl.close();
            return;
        }

        let populacao = Array.from({ length: tamanho_pop }, () => new Individuo());
        let melhor = new Individuo();
        melhor.nota = 9999;

        for (let geracao = 0; geracao < max_geracoes; geracao++) {
            for (const ind of populacao) {
                ind.avaliarNota(valor);
                if (ind.nota < melhor.nota) {
                    melhor = ind;
                }
            }
            
            const novaPopulacao = [];
            while (novaPopulacao.length < tamanho_pop) {
                const pai1 = populacao[Math.floor(Math.random() * populacao.length)];
                const pai2 = populacao[Math.floor(Math.random() * populacao.length)];
                const filho = cruzamento(pai1, pai2);
                mutacao(filho);
                filho.avaliarNota(valor);
                novaPopulacao.push(filho);
            }
            populacao = novaPopulacao;
        }

        console.log("\nMelhor solução encontrada:");
        if (melhor.nota === 9999) {
            console.log("Nenhuma solução exata encontrada dentro do limite de gerações.");
        } else {
            melhor.genes.forEach((qtd, i) => {
                if (qtd > 0) {
                    console.log(`${qtd} moeda(s) de ${moedas[i]} centavos`);
                }
            });
            console.log(`Total de moedas: ${melhor.totalMoedas()}`);
        }

        rl.close();
    });
}

main();
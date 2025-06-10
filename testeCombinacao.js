class Individuo {
  static qntVariaveis = 2;
  static tamanhoVetor = 5;

  constructor(vetor) {
    this.vetor = vetor;
    this.propabilidadeSelecao = 0;
    this.calcularPontuacao();
  }

  setVetor(vetor) {
    this.vetor = vetor;
    this.calcularPontuacao();
  }

  getVetor() {
    return this.vetor;
  }

  getValores() {
    const resultados = new Array(Individuo.qntVariaveis).fill(0);
    let resultado = 0;
    let cont = 0;
    let expoente = Individuo.tamanhoVetor;

    for (const bit of this.vetor) {
      const tmp = bit ? 1 : 0;
      expoente--;
      resultado += Math.pow(2, expoente) * tmp;
      if (expoente === 0) {
        expoente = Individuo.tamanhoVetor;
        resultados[cont] = resultado;
        resultado = 0;
        cont++;
      }
    }
    return this.normalizar(resultados);
  }

  normalizar(resultados) {
    const valores = new Array(Individuo.qntVariaveis);
    const maxValor = Math.pow(2, Individuo.tamanhoVetor) - 1;
    for (let i = 0; i < Individuo.qntVariaveis; i++) {
      valores[i] = 6 * (resultados[i] / maxValor);
    }
    return valores;
  }

  calcularPontuacao() {
    let soma = 0;
    const valores = this.getValores();
    for (const i of valores) {
      soma += i;
    }
    if (soma < 4) {
      this.pontuacao = 1000000;
      return;
    }
    this.pontuacao =
      0.25 * Math.pow(valores[0], 4) -
      3 * Math.pow(valores[0], 3) +
      11 * Math.pow(valores[0], 2) -
      13 * valores[0] +
      0.25 * Math.pow(valores[1], 4) -
      3 * Math.pow(valores[1], 3) +
      11 * Math.pow(valores[1], 2) -
      13 * valores[1];
  }

  getPontuacao() {
    return this.pontuacao;
  }

  mutar() {
    const totalSize = Individuo.tamanhoVetor * Individuo.qntVariaveis;
    for (let i = 0; i < totalSize; i++) {
      if (Math.random() <= 0.05) {
        this.vetor[i] = !this.vetor[i];
      }
    }
    this.calcularPontuacao();
  }

  recombinar(individuo) {
    const totalSize = Individuo.tamanhoVetor * Individuo.qntVariaveis;
    const inicio = Math.floor(Math.random() * totalSize);
    for (let i = inicio; i < totalSize; i++) {
      const tmp = this.vetor[i];
      this.vetor[i] = individuo.getVetor()[i];
      individuo.getVetor()[i] = tmp;
    }
  }

  setProbabilidadeSelecao(probabilidadeSelecao) {
    this.propabilidadeSelecao = probabilidadeSelecao;
  }

  getProbabilidadeSelecao() {
    return this.propabilidadeSelecao;
  }
}

const tamanhoPopulacao = 10;
let populacao = [];
const tamanhoVetor = 10;
const interacoes = 20;

function vetorAleatorio(tamanho) {
  const x = new Array(tamanho);
  for (let i = 0; i < tamanho; i++) {
    x[i] = Math.random() < 0.5;
  }
  return x;
}

function calcularProbabilidadeSelecao() {
  let soma = 0;
  for (const i of populacao) {
    if (i.getPontuacao() < 1000) {
      soma += i.getPontuacao() * -1;
    }
  }

  let probabilidadeAcumulada = 0;
  for (const i of populacao) {
    if (i.getPontuacao() < 1000) {
      const prob = (i.getPontuacao() * -1) / soma;
      probabilidadeAcumulada += prob;
      i.setProbabilidadeSelecao(probabilidadeAcumulada);
    } else {
      i.setProbabilidadeSelecao(-1);
    }
  }
}

function selecionarIndividuo(individuo) {
  let selecionado = null;
  do {
    const aleatorio = Math.random();
    for (const i of populacao) {
      if (i.getProbabilidadeSelecao() >= aleatorio) {
        selecionado = i;
        break;
      }
    }
  } while (selecionado === individuo);
  return selecionado;
}

populacao = new Array(tamanhoPopulacao);
for (let i = 0; i < tamanhoPopulacao; i++) {
  populacao[i] = new Individuo(vetorAleatorio(tamanhoVetor));
}

for (let i = 0; i < interacoes; i++) {
  let novaPopulacao = new Array(tamanhoPopulacao);
  calcularProbabilidadeSelecao();

  for (let j = 0; j < tamanhoPopulacao / 2; j++) {
    const pai1 = selecionarIndividuo(null);
    const pai2 = selecionarIndividuo(pai1);

    const filho1 = new Individuo([...pai1.getVetor()]);
    const filho2 = new Individuo([...pai2.getVetor()]);

    filho1.recombinar(filho2);

    if (i < interacoes) {
      filho1.mutar();
      filho2.mutar();
    }

    novaPopulacao[j * 2] = filho1;
    novaPopulacao[j * 2 + 1] = filho2;
  }
  populacao = novaPopulacao;
}

let melhor = populacao[0];
for (const i of populacao) {
  if (melhor.getPontuacao() > i.getPontuacao()) {
    melhor = i;
  }
}

const vetorMelhor = melhor.getVetor();
let output = "";
for (const j of vetorMelhor) {
  output += j ? "1" : "0";
}
console.log(output + " / " + melhor.getPontuacao());

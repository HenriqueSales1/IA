class ClasseThumbsUp {
  constructor(qntVariaveis, tamanhoVetor) {
    this.qntVariaveis = qntVariaveis;
    this.tamanhoVetor = tamanhoVetor;
    this.pont = 0;
    this.vetor = [];
  }
  setVetor(vetor) {
    this.vetor = vetor;
  }
  getVetor() {
    return this.vetor;
  }
  getPont() {
    return this.pont;
  }
  getValores() {
    const resultados = new Array(this.qntVariaveis);
    let resultado = 0;
    let cont = 0;
    let expoente = this.tamanhoVetor;

    for (const bit of this.vetor) {
      const temp = bit ? 1 : 0;
      expoente--;
      resultado += Math.pow(2, expoente) * temp;

      if (expoente === 0) {
        expoente = this.tamanhoVetor;
        resultados[cont] = resultado;
        resultado = 0;
        cont++;
      }
    }
    return this.normalizar(resultados);
  }

  normalizar(resultados) {
    const valores = new Array(this.qntVariaveis);
    const maxValor = Math.pow(2, this.tamanhoVetor) - 1;
    for (let i = 0; i < this.qntVariaveis; i++) {
      valores[i] = 6 * (resultados[i] / maxValor);
    }
    return valores;
  }
  calc() {
    const valores = this.getValores();
    const soma = valores.reduce((acc, val) => acc + val, 0);
    if (soma < 4) {
      this.pont = 1000;
      return;
    }
    this.pont =
      0.25 * Math.pow(valores[0], 4) -
      3 * Math.pow(valores[0], 3) +
      11 * Math.pow(valores[0], 2) -
      13 * valores[0] +
      0.25 * Math.pow(valores[1], 4) -
      3 * Math.pow(valores[1], 3) +
      11 * Math.pow(valores[1], 2) -
      13 * valores[1];
  }
  mutar() {
    for (let i = 0; i < this.vetor.length; i++) {
      if (Math.random() <= 0.05) {
        this.vetor[i] = !this.vetor[i];
      }
    }
  }
}

function vetRd(tamanho) {
  const x = new Array(tamanho);
  for (let i = 0; i < tamanho; i++) {
    x[i] = Math.random() < 0.5;
  }
  console.log("Vetor inicial:", x.join(" "));
  return x;
}

const tamanho = 10;
const iteracoes = 1000;

let ctu = new ClasseThumbsUp(2, 5);
ctu.setVetor(vetRd(tamanho));
ctu.calc();

for (let i = 0; i < iteracoes; i++) {
  const ctuFor = new ClasseThumbsUp(2, 5);
  ctuFor.setVetor([...ctu.getVetor()]);

  ctuFor.mutar();
  ctuFor.calc();

  if (ctu.getPont() > ctuFor.getPont()) {
    ctu = ctuFor;
  }
}
console.log("Melhor pontuação encontrada:", ctu.getPont());

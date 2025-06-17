    // =================================================================
// 1. CONFIGURAÇÃO E PARÂMETROS
// =================================================================

// Dados de amostra fornecidos pelo usuário.
// O algoritmo tentará encontrar uma fórmula para estes pontos.
const SAMPLE_DATA = [
    { x: 0, y: 6 }, { x: 1, y: 2 }, { x: 2, y: 0 }, { x: 3, y: 0 },
    { x: 4, y: 2 }, { x: 5, y: 6 }, { x: 6, y: 12 }, { x: 7, y: 20 },
    { x: 8, y: 30 }, { x: 9, y: 42 }, { x: 10, y: 56 }
];

// Elementos que o algoritmo pode usar para construir fórmulas
const FUNCTIONS = ['+', '-', '*']; // Operadores. Divisão foi removida por ser menos provável nesta função.
const TERMINALS = ['x', ...Array.from({ length: 15 }, () => Math.floor(Math.random() * 11))]; // Variável 'x' e constantes de 0 a 10

// Parâmetros do Algoritmo Genético
const POPULATION_SIZE = 1000;
const MAX_GENERATIONS = 500; // Aumentado um pouco para dar mais tempo para a convergência
const TOURNAMENT_SIZE = 5;
const CROSSOVER_RATE = 0.8;
const MUTATION_RATE = 0.15;
const MAX_INITIAL_DEPTH = 3;
const FITNESS_THRESHOLD = 0.9999; // Limiar para uma solução "perfeita"

// =================================================================
// 2. FUNÇÕES AUXILIARES (Sem alterações)
// =================================================================

const createNode = (value, type, children = []) => ({ value, type, children });

function createRandomTree(maxDepth) {
    if (maxDepth === 0 || Math.random() < 0.4) {
        const terminal = TERMINALS[Math.floor(Math.random() * TERMINALS.length)];
        return createNode(terminal, 'terminal');
    } else {
        const func = FUNCTIONS[Math.floor(Math.random() * FUNCTIONS.length)];
        const children = [createRandomTree(maxDepth - 1), createRandomTree(maxDepth - 1)];
        return createNode(func, 'function', children);
    }
}

function evaluateTree(tree, x) {
    if (tree.type === 'terminal') {
        return tree.value === 'x' ? x : tree.value;
    }
    const childValues = tree.children.map(child => evaluateTree(child, x));
    switch (tree.value) {
        case '+': return childValues[0] + childValues[1];
        case '-': return childValues[0] - childValues[1];
        case '*': return childValues[0] * childValues[1];
        // Divisão protegida
        case '/': return childValues[1] === 0 ? 1 : childValues[0] / childValues[1];
        default: return 0;
    }
}

function treeToString(tree) {
    if (tree.type === 'terminal') {
        return String(tree.value);
    }
    const childStrings = tree.children.map(child => treeToString(child));
    return `(${childStrings.join(` ${tree.value} `)})`;
}

function tournamentSelection(population, fitnessScores) {
    let best = null;
    let bestFitness = -1;
    for (let i = 0; i < TOURNAMENT_SIZE; i++) {
        const randomIndex = Math.floor(Math.random() * population.length);
        if (fitnessScores[randomIndex] > bestFitness) {
            bestFitness = fitnessScores[randomIndex];
            best = population[randomIndex];
        }
    }
    return best;
}

// Funções para pegar um nó aleatório e fazer o crossover/mutação
// Elas usam JSON.stringify/parse para fazer cópias profundas e evitar modificar os pais
function getRandomNode(tree) {
    const nodes = [];
    function traverse(node, parent, childIndex) {
        nodes.push({ node, parent, childIndex });
        if (node.type === 'function') {
            node.children.forEach((child, index) => traverse(child, node, index));
        }
    }
    traverse(tree, null, -1);
    return nodes[Math.floor(Math.random() * nodes.length)];
}

function crossover(parent1, parent2) {
    const child = JSON.parse(JSON.stringify(parent1));
    const { node: nodeToReplace, parent: parentOfNode, childIndex } = getRandomNode(child);
    const { node: newSubtree } = getRandomNode(JSON.parse(JSON.stringify(parent2)));
    if (parentOfNode) {
        parentOfNode.children[childIndex] = newSubtree;
    } else {
        return newSubtree; // Substituindo a raiz
    }
    return child;
}

function mutate(tree) {
    const mutatedTree = JSON.parse(JSON.stringify(tree));
    const { node: nodeToMutate, parent: parentOfNode, childIndex } = getRandomNode(mutatedTree);
    const newRandomSubtree = createRandomTree(Math.floor(MAX_INITIAL_DEPTH / 2));
    if (parentOfNode) {
        parentOfNode.children[childIndex] = newRandomSubtree;
    } else {
        return newRandomSubtree; // Mutando a raiz
    }
    return mutatedTree;
}

// =================================================================
// 3. FUNÇÃO PRINCIPAL DO ALGORITMO
// =================================================================

function runGP() {
    console.log("Iniciando Programação Genética para encontrar a fórmula...");
    console.log("Buscando uma fórmula para os dados:", SAMPLE_DATA.map(p => `f(${p.x})=${p.y}`).join('; '));
    
    let population = Array.from({ length: POPULATION_SIZE }, () => createRandomTree(MAX_INITIAL_DEPTH));

    for (let generation = 1; generation <= MAX_GENERATIONS; generation++) {
        const fitnessScores = population.map(individual => {
            let totalError = 0;
            for (const { x, y } of SAMPLE_DATA) {
                const y_pred = evaluateTree(individual, x);
                if (isNaN(y_pred)) { // Penaliza resultados inválidos
                    totalError += 1e9;
                } else {
                    totalError += (y - y_pred) ** 2; // Erro Quadrático
                }
            }
            return 1 / (1 + Math.sqrt(totalError / SAMPLE_DATA.length)); // Fitness baseado no RMSE
        });

        let bestFitness = -1;
        let bestIndividual = null;
        fitnessScores.forEach((score, index) => {
            if (score > bestFitness) {
                bestFitness = score;
                bestIndividual = population[index];
            }
        });
        
        const bestFormulaStr = treeToString(bestIndividual);
        // Limita o tamanho da fórmula impressa no console para não poluir
        const displayFormula = bestFormulaStr.length > 80 ? bestFormulaStr.substring(0, 77) + "..." : bestFormulaStr;
        console.log(`Geração: ${generation} | Melhor Aptidão: ${bestFitness.toFixed(5)} | Melhor Fórmula: ${displayFormula}`);

        if (bestFitness >= FITNESS_THRESHOLD) {
            console.log("\n✅ Solução encontrada com alta precisão!");
            console.log(`Fórmula Final: ${treeToString(bestIndividual)}`);
            return;
        }

        const newPopulation = [];
        newPopulation.push(bestIndividual); // Elitismo

        while (newPopulation.length < POPULATION_SIZE) {
            const parent1 = tournamentSelection(population, fitnessScores);
            const parent2 = tournamentSelection(population, fitnessScores);
            
            let child = (Math.random() < CROSSOVER_RATE) ? crossover(parent1, parent2) : JSON.parse(JSON.stringify(parent1));
            if (Math.random() < MUTATION_RATE) {
                child = mutate(child);
            }
            
            newPopulation.push(child);
        }
        population = newPopulation;
    }

    console.log("\n❌ Número máximo de gerações atingido. A melhor solução encontrada foi:");
    const finalBest = population[0];
    console.log(`Fórmula: ${treeToString(finalBest)}`);
}

// =================================================================
// 4. EXECUÇÃO
// =================================================================
runGP();
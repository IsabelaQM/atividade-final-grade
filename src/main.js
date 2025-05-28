// Gera as disciplinas de acordo com os parâmetros fixos
function gerarDisciplinas(totalDisciplinas, totalPeriodos, totalProfessores) {
  const disciplinas = [];
  for (let i = 0; i < totalDisciplinas; i++) {
    const periodo = Math.floor(i / (totalDisciplinas / totalPeriodos));
    const professor = i % totalProfessores;
    disciplinas.push({
      sigla: `D${i.toString().padStart(2, "0")}`,
      professor: `P${professor.toString().padStart(2, "0")}`,
      periodo: periodo,
    });
  }
  return disciplinas;
}

// Embaralha os elementos de um array
function embaralhar(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Gera a população inicial
function popInicial(disciplinas, linhas = 50, colunas = 100, totalPeriodos = 5) {
  const populacao = [];
  for (let i = 0; i < linhas; i++) {
    const individuo = Array(colunas).fill(null);
    for (let periodo = 0; periodo < totalPeriodos; periodo++) {
      const disciplinasDoPeriodo = disciplinas.filter(d => d.periodo === periodo);
      const disciplinasEmbaralhadas = embaralhar(disciplinasDoPeriodo);
      disciplinasEmbaralhadas.forEach((disciplina) => {
        let alocados = 0;
        const horariosDisponiveis = [];
        for (let j = 0; j < colunas; j++) {
          if (Math.floor(j / (colunas / totalPeriodos)) === periodo && individuo[j] === null) {
            horariosDisponiveis.push(j);
          }
        }
        const horariosEmbaralhados = embaralhar(horariosDisponiveis);
        for (const horario of horariosEmbaralhados) {
          if (alocados < 4) {
            individuo[horario] = `${disciplina.sigla} ${disciplina.professor}`;
            alocados++;
          } else {
            break;
          }
        }
      });
    }
    populacao.push(individuo);
  }
  return populacao;
}

// Calcula conflitos de um indivíduo
function avaliacao(grade, colunas = 100, totalPeriodos = 5) {
  let conflitos = 0;
  for (let dia = 0; dia < 5; dia++) {
    for (let horario = 0; horario < 4; horario++) {
      const professoresNesseHorario = new Set();
      for (let periodo = 0; periodo < totalPeriodos; periodo++) {
        const idx = periodo * (colunas / totalPeriodos) + dia * 4 + horario;
        const celula = grade[idx];
        if (celula) {
          const professor = celula.split(" ")[1];
          if (professoresNesseHorario.has(professor)) {
            conflitos++;
          } else {
            professoresNesseHorario.add(professor);
          }
        }
      }
    }
  }
  return conflitos;
}

// Ordena a população com base nos conflitos
function ordenacao(populacao, colunas, totalPeriodos) {
  return populacao
    .map(individuo => ({
      grade: individuo,
      conflitos: avaliacao(individuo, colunas, totalPeriodos),
    }))
    .sort((a, b) => a.conflitos - b.conflitos)
    .map(obj => obj.grade);
}

// Seleção por torneio
function selecao(populacao, colunas, totalPeriodos) {
  const idx1 = Math.floor(Math.random() * populacao.length);
  const idx2 = Math.floor(Math.random() * populacao.length);
  const ind1 = populacao[idx1];
  const ind2 = populacao[idx2];
  return [
    avaliacao(ind1, colunas, totalPeriodos) < avaliacao(ind2, colunas, totalPeriodos) ? ind1 : ind2,
    avaliacao(ind1, colunas, totalPeriodos) >= avaliacao(ind2, colunas, totalPeriodos) ? ind1 : ind2,
  ];
}

// Cruzamento multiponto (apenas nos limites dos períodos)
function cruzamento(pais, cortes = 2, pc = 0.7, totalPeriodos = 5, colunas = 100) {
  const filhos = [[], []];
  if (Math.random() < pc) {
    cortes = Math.max(1, Math.min(4, cortes));
    const pontos = new Set();
    while (pontos.size < cortes) {
      const ponto = Math.floor(Math.random() * totalPeriodos) + 1;
      pontos.add(ponto);
    }
    const pontosOrdenados = Array.from(pontos).sort((a, b) => a - b);
    let cruza = false;
    let inicio = 0;
  
    for (const ponto of pontosOrdenados) {
      const fim = ponto * (colunas / totalPeriodos);
      for (let j = inicio; j < fim; j++) {
        filhos[0][j] = cruza ? pais[1][j] : pais[0][j];
        filhos[1][j] = cruza ? pais[0][j] : pais[1][j];
      }
      cruza = !cruza;
      inicio = fim;
    }
    for (let j = inicio; j < colunas; j++) {
      filhos[0][j] = cruza ? pais[1][j] : pais[0][j];
      filhos[1][j] = cruza ? pais[0][j] : pais[1][j];
    }
  } else {
    filhos[0] = [...pais[0]];
    filhos[1] = [...pais[1]];
  }
  return filhos;
}

// Mutação: troca dois horários dentro de cada período
function mutacao(filhos, pm = 0.1, totalPeriodos = 5, colunas = 100) {
  for (let k = 0; k < filhos.length; k++) {
    if (Math.random() < pm) {
      for (let periodo = 0; periodo < totalPeriodos; periodo++) {
        const base = periodo * (colunas / totalPeriodos);
        const p1 = base + Math.floor(Math.random() * (colunas / totalPeriodos));
        const p2 = base + Math.floor(Math.random() * (colunas / totalPeriodos));
        const temp = filhos[k][p1];
        filhos[k][p1] = filhos[k][p2];
        filhos[k][p2] = temp;
      }
    }
  }
  return filhos;
}
  
// Algoritmo Genético principal
function algoritmoGenetico({
  totalDisciplinas,
  totalPeriodos,
  totalProfessores,
  totalPopulacao,
  colunas,
  maxGeracoes,
  pc,
  pm,
  cortes,
}) {
  const disciplinas = gerarDisciplinas(totalDisciplinas, totalPeriodos, totalProfessores);
  let populacao = popInicial(disciplinas, totalPopulacao, colunas, totalPeriodos);
  populacao = ordenacao(populacao, colunas, totalPeriodos);
  
  let melhorIndividuo = populacao[0].slice();
  let melhorConflitos = avaliacao(melhorIndividuo, colunas, totalPeriodos);
  
  for (let geracao = 0; geracao < maxGeracoes; geracao++) {
    let novaPopulacao = [];
    while (novaPopulacao.length < totalPopulacao) {
      const pais = selecao(populacao, colunas, totalPeriodos);
      let filhos = cruzamento(pais, cortes, pc, totalPeriodos, colunas);
      filhos = mutacao(filhos, pm, totalPeriodos, colunas);
      novaPopulacao.push(filhos[0]);
      if (novaPopulacao.length < totalPopulacao) {
        novaPopulacao.push(filhos[1]);
      }
    }
    populacao = ordenacao(novaPopulacao, colunas, totalPeriodos);
    
    const conflitosAtual = avaliacao(populacao[0], colunas, totalPeriodos);
    if (conflitosAtual < melhorConflitos) {
      melhorIndividuo = populacao[0].slice();
      melhorConflitos = conflitosAtual;
    }
  }
  return { melhorIndividuo, melhorConflitos, populacao };
}
  
// Renderiza uma grade em forma de tabela
function renderizarGrade(populacao, containerId, colunas = 100, totalPeriodos = 5) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  const tabela = document.createElement("table");
  // Cabeçalho com os períodos
  const trPeriodos = document.createElement("tr");
  const thVazio = document.createElement("th");
  thVazio.rowSpan = 2;
  thVazio.textContent = "#";
  trPeriodos.appendChild(thVazio);
  for (let i = 0; i < totalPeriodos; i++) {
    const th = document.createElement("th");
    th.colSpan = colunas / totalPeriodos;
    th.textContent = `Período ${i + 1}`;
    trPeriodos.appendChild(th);
  }
  tabela.appendChild(trPeriodos);
  // Cabeçalho com os horários
  const trHorarios = document.createElement("tr");
  for (let i = 0; i < colunas; i++) {
    const th = document.createElement("th");
    th.textContent = i + 1;
    trHorarios.appendChild(th);
  }
  tabela.appendChild(trHorarios);
  
  // Corpo da tabela com os dados da grade
  populacao.forEach((linha, index) => {
    const tr = document.createElement("tr");
    const thLinha = document.createElement("th");
    thLinha.textContent = index + 1;
    tr.appendChild(thLinha);
    linha.forEach(celula => {
      const td = document.createElement("td");
      td.textContent = celula ? celula : "";
      tr.appendChild(td);
    });
    tabela.appendChild(tr);
  });
  container.appendChild(tabela);
}

// Função para renderizar a grade de horários da semana de maneira mais visual
function renderizarGradePorPeriodo(individuo, containerId, totalPeriodos = 5, colunas = 100) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  const cellsPerPeriod = colunas / totalPeriodos;
  const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
  const horas = ["1ª Aula", "2ª Aula", "3ª Aula", "4ª Aula"];
  
  // Para cada período, cria uma tabela separada
  for (let p = 0; p < totalPeriodos; p++) {
    const table = document.createElement("table");
    
    // Cabeçalho de período
    const caption = document.createElement("caption");
    caption.textContent = `Período ${p + 1}`;
    table.appendChild(caption);
    
    // Cabeçalho com os dias da semana
    const trHeader = document.createElement("tr");
    const thEmpty = document.createElement("th");
    thEmpty.textContent = "";
    trHeader.appendChild(thEmpty);
    dias.forEach(dia => {
      const th = document.createElement("th");
      th.textContent = dia;
      trHeader.appendChild(th);
    });
    table.appendChild(trHeader);
    
    // Cria as linhas para os horários (4 por dia)
    for (let h = 0; h < horas.length; h++) {
      const tr = document.createElement("tr");
      const thHora = document.createElement("th");
      thHora.textContent = horas[h];
      tr.appendChild(thHora);
      
      // Para cada dia
      for (let d = 0; d < dias.length; d++) {
        const td = document.createElement("td");
        // Calcula o índice na matriz:
        // índice = (período * cellsPerPeriod) + (dia * 4) + horário
        const index = p * cellsPerPeriod + d * 4 + h;
        td.textContent = individuo[index] || "";
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    
    container.appendChild(table);
  }
}

// Função para executar o AG e mostrar o melhor resultado
function executarAG() {
  const totalDisciplinas = 25; 
  const totalPeriodos = 5;     
  const totalProfessores = 10;  
  let totalPopulacao = parseInt(document.getElementById("tamPop").value);
  const colunas = 100;          
  const maxGeracoes = parseInt(document.getElementById("maxGen").value);
  const pc = parseFloat(document.getElementById("pc").value);
  const pm = parseFloat(document.getElementById("pm").value);
  let cortes = parseInt(document.getElementById("cortes").value);
  
  // Validação dos parâmetros de entrada e mensagem de erro
  if(totalPopulacao <= 0 || maxGeracoes <= 0 || pc <= 0 || pc > 1 || pm <= 0 || pm > 1){
      alert("Parâmetros Inválidos, insira-os novamente!");
      return;
  }
  
  // Garante que o tamanho da população gerada seja par
  if(totalPopulacao % 2 !== 0)
      totalPopulacao++;


  // Se cortes estiver fora do intervalo, ajusta para 1 ou 4.
  cortes = Math.max(1, Math.min(4, cortes));
  
  const { melhorIndividuo, melhorConflitos, populacao } = algoritmoGenetico({
    totalDisciplinas,
    totalPeriodos,
    totalProfessores,
    totalPopulacao,
    colunas,
    maxGeracoes,
    pc,
    pm,
    cortes,
  });
  
  renderizarGradePorPeriodo(melhorIndividuo, "melhor-grade", totalPeriodos, colunas);

  // Exibindo as geracoes somente a título de exemplo
  renderizarGrade(populacao, "app", colunas, totalPeriodos);
  
  const info = document.getElementById("info-melhor");
  if (info) {
    info.textContent = `Conflitos do melhor horário: ${melhorConflitos}`;
  }
}
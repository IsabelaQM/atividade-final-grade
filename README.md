# Gerador de Grades Horárias

Projeto para a geração e otimização automática de grades horárias para o curso de Sistemas para Internet. O sistema utiliza um Algoritmo Genético (AG) para criar, avaliar e selecionar a melhor grade, considerando restrições como períodos, dias da semana, horários e a alocação de professores.

## Objetivo

- Gerar grades horárias para as turmas do curso de Sistemas para Internet.
- Selecionar a melhor grade com o menor número de conflitos, garantindo que cada disciplina seja correta e uniformemente distribuída.
- Utilizar técnicas de AG para explorar soluções via processos de seleção, cruzamento e mutação.

## Requisitos

- **5 períodos**: Cada disciplina pertence a um dos 5 períodos do curso.
- **5 dias da semana**: Aulas de segunda a sexta-feira.
- **4 horários por dia**: Quatro possíveis horários diariamente.
- **4 horários por disciplina por semana**: Cada disciplina é alocada em 4 horários durante a semana.
- **25 disciplinas**: O currículo possui 25 disciplinas.
- **10 professores**: Cada disciplina tem um professor fixo, somando 10 professores.
- **50 possibilidades de grade horária**: O sistema gera 50 grades diferentes.

## Algoritmo Genético

O AG implementado no projeto contempla as seguintes etapas:

- **Geração das Disciplinas**:  
  A função `gerarDisciplinas` cria o conjunto de disciplinas, atribuindo períodos e professores.

- **População Inicial**:  
  A função `popInicial` gera a população inicial distribuindo as disciplinas nos horários disponíveis de forma aleatória por período.

- **Avaliação de Conflitos**:  
  A função `avaliacao` analisa cada grade, contabilizando conflitos quando o mesmo professor é alocado em horários simultâneos.

- **Ordenação da População**:  
  A função `ordenacao` classifica as grades com base no número de conflitos, permitindo a priorização das melhores soluções.

- **Seleção**:  
  A função `selecao` utiliza um método de torneio para escolher dois indivíduos (um da primeira metade e outro de forma aleatória) para o cruzamento.

- **Cruzamento**:  
  A função `cruzamento` realiza um cruzamento multiponto, combinando partes dos pais que delimitam os períodos, para gerar novos indivíduos.

- **Mutação**:  
  A função `mutacao` promove pequenas trocas de horários dentro de cada período, introduzindo variações.

## Tecnologias Utilizadas

- **HTML5**
- **CSS3**
- **JavaScript**

## Como Executar

1. Clone o repositório ou copie os arquivos para o seu ambiente local.
2. Abra o arquivo `index.html` em um navegador.
3. Configure os parâmetros do AG (tamanho da população, número máximo de gerações, probabilidades de cruzamento e mutação) na interface.
4. Clique em "Executar" para gerar e exibir a grade horária resultante e as gerações intermediárias.

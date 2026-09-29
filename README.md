# Desafio Técnico — Estágio em Qualidade (LogiTrack Pro)

Repositório com a entrega do desafio técnico de Estágio em Qualidade da LogAp, 
referente à análise de qualidade do sistema LogiTrack Pro.

## Organização dos materiais

- **`Relatorio_principal.pdf`**: relatório 
  completo da entrega, contendo os cenários de teste executados (seção A), a 
  análise de experiência do usuário / UX (seção B) e a proposta de estratégia 
  de testes adicionais e sugestões de melhoria no processo (seção C).
- **`cypress/`**: prova de conceito de automação de testes com Cypress, incluindo:
  - `cypress/cypress/e2e/login.cy.js`: teste de interface (UI) do fluxo de login, 
    incluindo o cenário que evidencia a falha de autenticação com senha incorreta.
  - `cypress/cypress/e2e/api/login.cy.js`: testes de API do endpoint de autenticação.
  - `cypress/cypress/e2e/api/veiculos.cy.js`: testes de API do módulo de veículos.
  - `cypress/cypress/e2e/api/manutencoes.cy.js`: testes de API do módulo de manutenções.
  - `cypress/cypress/screenshots/`: evidências (prints) geradas automaticamente 
    pelos testes, incluindo a captura do bug de login com senha incorreta.

## Ferramentas utilizadas

- **Cypress** (v16): automação de testes de interface e de API.
- **Insomnia**: exploração manual dos endpoints da API antes da automação dos testes.
- **DevTools do navegador**: inspeção de elementos, acessibilidade e requisições de rede.

## Premissas consideradas

- As credenciais fornecidas no desafio (`logap@teste.com`) foram usadas 
  exclusivamente para fins de teste, conforme instruído.
- Os testes de API foram executados diretamente contra 
  `https://api-logitrack.danieldiegosantana.me/v1`.
- Dados criados durante os testes automatizados (ex.: veículo de teste cadastrado 
  via API) são removidos ao final da própria execução do teste, quando aplicável.


## Como executar os testes automatizados

1. Entrar na pasta do projeto Cypress:
```bash
   cd cypress
```
2. Instalar as dependências:
```bash
   npm install
```
3. Rodar todos os testes:
```bash
   npx cypress run
```
4. Ou rodar apenas os testes de API:
```bash
   npx cypress run --spec "cypress/e2e/api/**/*.cy.js"
```
5. Ou rodar apenas o teste de login (interface):
```bash
   npx cypress run --spec "cypress/e2e/login.cy.js"
```

## Principais achados

- **Gravíssimo:** a API de autenticação (`POST /v1/auth/login`) autentica com 
  sucesso mesmo quando a senha informada está incorreta, retornando um token 
  válido.
- **Gravíssimo:** a funcionalidade de autocadastro (`/register`) permite que qualquer 
  pessoa crie uma conta e acesse os dados operacionais da frota, sem qualquer 
  vínculo com a empresa.
- Inconsistências de validação de dados (ex.: aceitação de ano de fabricação 
  negativo) e de uso de códigos de status HTTP em endpoints da API (ex.: 403 
  retornado para um erro de formato de campo, quando o esperado seria 400).

Detalhes completos de cada achado, incluindo passos de reprodução, evidências 
e impacto, estão no relatório PDF.

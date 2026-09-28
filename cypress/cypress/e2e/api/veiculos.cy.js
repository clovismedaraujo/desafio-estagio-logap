const API_BASE = "https://api-logitrack.danieldiegosantana.me/v1";

describe("API - Veículos", () => {
  let token;

  before(() => {
    cy.request("POST", `${API_BASE}/auth/login`, {
      email: "logap@teste.com",
      password: "teste@123",
    }).then((res) => {
      token = res.body.data.token;
    });
  });

  it("lista veículos com token válido", () => {
    cy.request({
      method: "GET",
      url: `${API_BASE}/veiculos`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.be.an("array");
    });
  });

  it("bloqueia listagem sem token", () => {
    cy.request({
      method: "GET",
      url: `${API_BASE}/veiculos`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([401, 403]);
    });
  });

  it("bloqueia listagem com token inválido", () => {
    cy.request({
      method: "GET",
      url: `${API_BASE}/veiculos`,
      headers: { Authorization: "Bearer token-forjado-123" },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([401, 403]);
    });
  });

  it("cadastra veículo com dados válidos e depois remove", () => {
    const placaAleatoria = "TST" + Math.floor(1000 + Math.random() * 9000);

    cy.request({
      method: "POST",
      url: `${API_BASE}/veiculos`,
      headers: { Authorization: `Bearer ${token}` },
      body: {
        placa: placaAleatoria,
        modelo: "Veículo Teste Cypress",
        ano: 2024,
        tipo: "LEVE",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
      expect(response.body.data).to.have.property("placa", placaAleatoria);

      const id = response.body.data.id;
      cy.log("Veículo criado com id: " + id);

      cy.request({
        method: "DELETE",
        url: `${API_BASE}/veiculos/${id}`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((deleteResponse) => {
        expect(deleteResponse.status).to.be.oneOf([200, 204]);
      });
    });
  });

  it("[bug de status HTTP] valor de tipo em minúsculo retorna 403 em vez de 400", () => {
    cy.request({
      method: "POST",
      url: `${API_BASE}/veiculos`,
      headers: { Authorization: `Bearer ${token}` },
      body: {
        placa: "API8Y88",
        modelo: "Teste Tipo Minusculo",
        ano: 2024,
        tipo: "Leve", 
      },
      failOnStatusCode: false,
    }).then((response) => {
      cy.log("Status: " + response.status);
      cy.log(JSON.stringify(response.body));
    });
  });

  it("não deve aceitar cadastro com ano negativo", () => {
    const placaAleatoria = "API" + Math.floor(1000 + Math.random() * 9000);
    cy.request({
      method: "POST",
      url: `${API_BASE}/veiculos`,
      headers: { Authorization: `Bearer ${token}` },
      body: { placa: placaAleatoria, modelo: "Teste API Ano", ano: -2020, tipo: "LEVE" },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it("não deve aceitar placa duplicada", () => {
    cy.request({
      method: "POST",
      url: `${API_BASE}/veiculos`,
      headers: { Authorization: `Bearer ${token}` },
      body: { placa: "QVD9C33", modelo: "Duplicado API", ano: 2024, tipo: "LEVE" }, 
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 409]);
    });
  });

  it("não deve aceitar cadastro sem placa", () => {
    cy.request({
      method: "POST",
      url: `${API_BASE}/veiculos`,
      headers: { Authorization: `Bearer ${token}` },
      body: { modelo: "Sem Placa", ano: 2024, tipo: "LEVE" },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

});
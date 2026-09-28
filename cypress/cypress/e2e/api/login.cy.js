const API_BASE = "https://api-logitrack.danieldiegosantana.me/v1";

describe("API - Login", () => {
    it("login com credenciais corretas retorna 200 e token", () => {
  cy.request({
    method: "POST",
    url: `${API_BASE}/auth/login`,
    body: {
      email: "logap@teste.com",
      password: "teste@123",
    },
    failOnStatusCode: false,
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.status).to.eq(200);
    expect(response.body.message).to.eq("Login successful");
    expect(response.body.data).to.have.property("token");
    expect(response.body.data.email).to.eq("logap@teste.com");
  });
});


  it("não deve autenticar com senha incorreta", () => {
  cy.request({
    method: "POST",
    url: `${API_BASE}/auth/login`,
    body: {
      email: "logap@teste.com",
      password: "senhaErrada999",
    },
    failOnStatusCode: false,
  }).then((response) => {
    cy.log("Status: " + response.status);
    expect(response.status).to.eq(401); 
  });
});

  it("login com e-mail inexistente", () => {
    cy.request({
      method: "POST",
      url: `${API_BASE}/auth/login`,
      body: {
        email: "naoexiste@teste.com",
        password: "qualquerCoisa123",
      },
      failOnStatusCode: false,
    }).then((response) => {
      cy.log("Status: " + response.status);
      expect(response.status).to.be.oneOf([401, 404]); 
    });
  });

  it("login com campos vazios", () => {
    cy.request({
      method: "POST",
      url: `${API_BASE}/auth/login`,
      body: { email: "", password: "" },
      failOnStatusCode: false,
    }).then((response) => {
      cy.log("Status: " + response.status);
      expect(response.status).to.eq(400); 
    });
  });
});
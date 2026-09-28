Cypress.on("uncaught:exception", () => {
  return false;
});

describe("Login", () => {
  it("[BUG?] sistema autentica mesmo com senha incorreta", () => {
    cy.intercept("POST", "**/login").as("loginRequest"); // ajuste a URL se for diferente

    cy.visit("/login");
    cy.get("#email").type("logap@teste.com");
    cy.get("#password").type("qualquerSenhaErrada999");
    cy.contains("button", "Entrar").click();

    cy.wait("@loginRequest").then((interception) => {
      cy.log("Status da resposta: " + interception.response.statusCode);
    });

    cy.url().should("include", "/dashboard");
    cy.contains("Dashboard").should("be.visible");
    cy.screenshot("bug-login-senha-incorreta");
  });
});
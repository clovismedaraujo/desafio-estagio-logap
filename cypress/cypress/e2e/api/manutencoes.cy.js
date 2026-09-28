const API_BASE = "https://api-logitrack.danieldiegosantana.me/v1";

describe("API - Manutenções", () => {
  let token;

  before(() => {
    cy.request("POST", `${API_BASE}/auth/login`, {
      email: "logap@teste.com",
      password: "teste@123",
    }).then((res) => {
      token = res.body.data.token;
    });
  });

  it("lista manutenções com token válido", () => {
    cy.request({
      method: "GET",
      url: `${API_BASE}/manutencoes`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.be.an("array");
    });
  });

  it("bloqueia listagem sem token", () => {
    cy.request({
      method: "GET",
      url: `${API_BASE}/manutencoes`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([401, 403]);
    });
  });

  it("bloqueia listagem com token inválido", () => {
    cy.request({
      method: "GET",
      url: `${API_BASE}/manutencoes`,
      headers: { Authorization: "Bearer token-forjado-123" },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([401, 403]);
    });
  });

  it("valida a estrutura de cada manutenção retornada", () => {
    cy.request({
      method: "GET",
      url: `${API_BASE}/manutencoes`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      const item = response.body.data[0];
      expect(item).to.have.all.keys(
        "id", "veiculoId", "veiculoPlaca", "veiculoModelo",
        "dataInicio", "dataFinalizacao", "tipoServico",
        "custoEstimado", "status"
      );
      expect(item.id).to.be.a("number");
      expect(item.custoEstimado).to.be.a("number");
    });
  });

  it("custoEstimado nunca deve ser negativo", () => {
    cy.request({
      method: "GET",
      url: `${API_BASE}/manutencoes`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      response.body.data.forEach((item) => {
        expect(item.custoEstimado).to.be.at.least(0);
      });
    });
  });

  it("status deve ser um dos valores válidos conhecidos", () => {
    cy.request({
      method: "GET",
      url: `${API_BASE}/manutencoes`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      response.body.data.forEach((item) => {
        expect(item.status).to.be.oneOf(["PENDENTE", "CONCLUIDA", "EM_REALIZACAO"]);
        // ajustar os valores acima conforme os que realmente existirem na API
      });
    });
  });

  it("cadastra manutenção com dados válidos e depois remove", () => {
    cy.request({
      method: "GET",
      url: `${API_BASE}/veiculos`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((veiculosResponse) => {
      const veiculoId = veiculosResponse.body.data[0].id; // usa o primeiro veículo existente

      cy.request({
        method: "POST",
        url: `${API_BASE}/manutencoes`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          veiculoId: veiculoId,
          tipoServico: "Revisao preventiva",
          dataInicio: "2026-10-01",
          dataFinalizacao: "2026-10-02",
          custoEstimado: 200,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
        const id = response.body.data.id;
        cy.log("Manutenção criada com id: " + id);

        // limpeza
        cy.request({
          method: "DELETE",
          url: `${API_BASE}/manutencoes/${id}`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        }).then((deleteResponse) => {
          expect(deleteResponse.status).to.be.oneOf([200, 204]);
        });
      });
    });
  });

  it("não deve aceitar manutenção com veiculoId inexistente", () => {
    cy.request({
      method: "POST",
      url: `${API_BASE}/manutencoes`,
      headers: { Authorization: `Bearer ${token}` },
      body: {
        veiculoId: 999999,
        tipoServico: "Revisao preventiva",
        dataInicio: "2026-10-01",
        dataFinalizacao: "2026-10-02",
        custoEstimado: 200,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 404]);
    });
  });

  it("não deve aceitar custoEstimado negativo", () => {
    cy.request({
      method: "GET",
      url: `${API_BASE}/veiculos`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((veiculosResponse) => {
      const veiculoId = veiculosResponse.body.data[0].id;

      cy.request({
        method: "POST",
        url: `${API_BASE}/manutencoes`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          veiculoId: veiculoId,
          tipoServico: "Revisao preventiva",
          dataInicio: "2026-10-01",
          dataFinalizacao: "2026-10-02",
          custoEstimado: -200,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });
  });

  it("não deve aceitar dataFinalizacao anterior à dataInicio", () => {
    cy.request({
      method: "GET",
      url: `${API_BASE}/veiculos`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((veiculosResponse) => {
      const veiculoId = veiculosResponse.body.data[0].id;

      cy.request({
        method: "POST",
        url: `${API_BASE}/manutencoes`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          veiculoId: veiculoId,
          tipoServico: "Revisao preventiva",
          dataInicio: "2026-10-10",
          dataFinalizacao: "2026-10-01", // antes do início
          custoEstimado: 200,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });
  });

  it("retorna 404 ao buscar manutenção inexistente", () => {
    cy.request({
      method: "GET",
      url: `${API_BASE}/manutencoes/999999`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
});
// producao.js - Sistema de Produção Completo CORRIGIDO
const API_BASE = "./";
let lotesDisponiveis = [];

// ====================================
// INICIALIZAÇÃO
// ====================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🏭 Inicializando módulo de produção...");

  carregarSabores();
  carregarTiposPicole();
  carregarEmbalagens();
  carregarIngredientes();
  carregarAditivos();
  carregarConservantes();
  carregarPicoles();
  carregarLotes();
  carregarPicolesParaLote();
  carregarTiposFiltro();

  configurarFormularios();
  configurarFiltros();
  configurarBotoes();
});

// ====================================
// CARREGAR SABORES
// ====================================
async function carregarSabores() {
  try {
    const response = await fetch(
      API_BASE + "api_cadastros.php?action=listar-sabores"
    );
    const sabores = await response.json();

    const select = document.getElementById("picole-sabor");
    if (select) {
      select.innerHTML =
        '<option value="">Selecione o sabor</option>' +
        sabores
          .map((s) => `<option value="${s.id}">${s.nome}</option>`)
          .join("");
      console.log(`✅ ${sabores.length} sabores carregados`);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar sabores:", error);
  }
}

// ====================================
// CARREGAR TIPOS DE PICOLÉ
// ====================================
async function carregarTiposPicole() {
  try {
    const response = await fetch(
      API_BASE + "api_cadastros.php?action=listar-tipos"
    );
    const tipos = await response.json();

    const select = document.getElementById("picole-tipo");
    if (select) {
      select.innerHTML =
        '<option value="">Selecione o tipo</option>' +
        tipos.map((t) => `<option value="${t.id}">${t.nome}</option>`).join("");
      console.log(`✅ ${tipos.length} tipos carregados`);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar tipos:", error);
  }
}

// ====================================
// CARREGAR EMBALAGENS
// ====================================
async function carregarEmbalagens() {
  try {
    const response = await fetch(
      API_BASE + "api_cadastros.php?action=listar-embalagens"
    );
    const embalagens = await response.json();

    const select = document.getElementById("picole-embalagem");
    if (select) {
      select.innerHTML =
        '<option value="">Selecione a embalagem</option>' +
        embalagens
          .map((e) => `<option value="${e.id}">${e.nome}</option>`)
          .join("");
      console.log(`✅ ${embalagens.length} embalagens carregadas`);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar embalagens:", error);
  }
}

// ====================================
// CARREGAR INGREDIENTES
// ====================================
async function carregarIngredientes() {
  try {
    const response = await fetch(
      API_BASE + "api_cadastros.php?action=listar-ingredientes"
    );
    const ingredientes = await response.json();

    const container = document.getElementById("picole-ingredientes");
    if (container) {
      container.innerHTML = ingredientes
        .map(
          (i) => `
        <div class="checkbox-item">
          <input type="checkbox" id="ing-${i.id}" name="ingredientes[]" value="${i.id}">
          <label for="ing-${i.id}">${i.nome}</label>
        </div>
      `
        )
        .join("");
      console.log(`✅ ${ingredientes.length} ingredientes carregados`);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar ingredientes:", error);
  }
}

// ====================================
// CARREGAR ADITIVOS
// ====================================
async function carregarAditivos() {
  try {
    const response = await fetch(
      API_BASE + "api_cadastros.php?action=listar-aditivos"
    );
    const aditivos = await response.json();

    const container = document.getElementById("picole-aditivos");
    if (container) {
      container.innerHTML = aditivos
        .map(
          (a) => `
        <div class="checkbox-item">
          <input type="checkbox" id="adit-${a.id}" name="aditivos[]" value="${a.id}">
          <label for="adit-${a.id}">${a.nome}</label>
        </div>
      `
        )
        .join("");
      console.log(`✅ ${aditivos.length} aditivos carregados`);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar aditivos:", error);
  }
}

// ====================================
// CARREGAR CONSERVANTES
// ====================================
async function carregarConservantes() {
  try {
    const response = await fetch(
      API_BASE + "api_cadastros.php?action=listar-conservantes"
    );
    const conservantes = await response.json();

    const container = document.getElementById("picole-conservantes");
    if (container) {
      container.innerHTML = conservantes
        .map(
          (c) => `
        <div class="checkbox-item">
          <input type="checkbox" id="cons-${c.id}" name="conservantes[]" value="${c.id}">
          <label for="cons-${c.id}">${c.nome}</label>
        </div>
      `
        )
        .join("");
      console.log(`✅ ${conservantes.length} conservantes carregados`);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar conservantes:", error);
  }
}

// ====================================
// CARREGAR PICOLÉS CADASTRADOS
// ====================================
async function carregarPicoles() {
  try {
    const response = await fetch(
      API_BASE + "api_producao.php?action=listar-picoles"
    );
    const picoles = await response.json();

    const tbody = document.getElementById("table-picoles");
    if (tbody) {
      if (picoles.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="6" class="text-center text-muted">Nenhum picolé cadastrado</td></tr>';
      } else {
        tbody.innerHTML = picoles
          .map(
            (p) => `
          <tr>
            <td>${p.id}</td>
            <td>${p.sabor_nome}</td>
            <td>${p.tipo_nome}</td>
            <td>${p.embalagem_nome}</td>
            <td>R$ ${parseFloat(p.preco).toFixed(2)}</td>
            <td>
              <button class="btn btn-danger btn-sm" onclick="deletarPicole(${
                p.id
              })">
                🗑️ Excluir
              </button>
            </td>
          </tr>
        `
          )
          .join("");
      }
      console.log(`✅ ${picoles.length} picolés carregados`);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar picolés:", error);
  }
}

// ====================================
// CARREGAR PICOLÉS PARA CRIAÇÃO DE LOTE
// ====================================
async function carregarPicolesParaLote() {
  try {
    const response = await fetch(
      API_BASE + "api_producao.php?action=listar-picoles"
    );
    const picoles = await response.json();

    const select = document.getElementById("lote-picole");
    if (select) {
      select.innerHTML =
        '<option value="">Selecione o picolé</option>' +
        picoles
          .map(
            (p) =>
              `<option value="${p.id}">${p.sabor_nome} - ${
                p.tipo_nome
              } (R$ ${parseFloat(p.preco).toFixed(2)})</option>`
          )
          .join("");
      console.log(`✅ ${picoles.length} picolés carregados para lote`);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar picolés para lote:", error);
  }
}

// ====================================
// CARREGAR LOTES
// ====================================
async function carregarLotes() {
  try {
    const response = await fetch(
      API_BASE + "api_producao.php?action=listar-lotes"
    );
    const lotes = await response.json();

    const tbody = document.getElementById("table-lotes");
    if (tbody) {
      if (lotes.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="6" class="text-center text-muted">Nenhum lote cadastrado</td></tr>';
      } else {
        tbody.innerHTML = lotes
          .map((l) => {
            const statusClass = l.status === "ATIVO" ? "success" : "danger";
            return `
            <tr>
              <td>${l.id}</td>
              <td>${l.tipo_nome}</td>
              <td>${l.quantidade_total}</td>
              <td>${l.quantidade_disponivel}</td>
              <td><span class="badge badge-${statusClass}">${l.status}</span></td>
              <td>
                <button class="btn btn-secondary btn-sm" onclick="verDetalhesLote(${l.id})">
                  👁️ Ver
                </button>
              </td>
            </tr>
          `;
          })
          .join("");
      }
      console.log(`✅ ${lotes.length} lotes carregados`);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar lotes:", error);
  }
}

// ====================================
// CARREGAR TIPOS PARA FILTRO
// ====================================
async function carregarTiposFiltro() {
  try {
    const response = await fetch(
      API_BASE + "api_cadastros.php?action=listar-tipos"
    );
    const tipos = await response.json();

    const select = document.getElementById("filter-tipo-lote");
    if (select) {
      select.innerHTML =
        '<option value="">Todos os tipos</option>' +
        tipos.map((t) => `<option value="${t.id}">${t.nome}</option>`).join("");
    }
  } catch (error) {
    console.error("❌ Erro ao carregar tipos para filtro:", error);
  }
}

// ====================================
// CONFIGURAR FORMULÁRIOS
// ====================================
function configurarFormularios() {
  // Formulário de Picolé
  const formPicole = document.getElementById("form-picole");
  if (formPicole) {
    formPicole.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(formPicole);

      // Coletar ingredientes selecionados
      const ingredientes = [];
      document
        .querySelectorAll('input[name="ingredientes[]"]:checked')
        .forEach((cb) => {
          ingredientes.push(cb.value);
        });

      // Coletar aditivos selecionados
      const aditivos = [];
      document
        .querySelectorAll('input[name="aditivos[]"]:checked')
        .forEach((cb) => {
          aditivos.push(cb.value);
        });

      // Coletar conservantes selecionados
      const conservantes = [];
      document
        .querySelectorAll('input[name="conservantes[]"]:checked')
        .forEach((cb) => {
          conservantes.push(cb.value);
        });

      const data = {
        id_sabor: formData.get("id_sabor"),
        id_tipo_picole: formData.get("id_tipo_picole"),
        id_tipo_embalagem: formData.get("id_tipo_embalagem"),
        preco: formData.get("preco"),
        ingredientes: ingredientes,
        aditivos: aditivos,
        conservantes: conservantes,
      };

      try {
        const response = await fetch(
          API_BASE + "api_producao.php?action=salvar-picole",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );

        const result = await response.json();

        if (result.success) {
          alert("✅ " + result.message);
          formPicole.reset();
          await carregarPicoles();
          await carregarPicolesParaLote();
        } else {
          alert("❌ " + result.message);
        }
      } catch (error) {
        console.error("❌ Erro:", error);
        alert("❌ Erro ao salvar picolé.");
      }
    });
  }

  // Formulário de Lote
  const formLote = document.getElementById("form-lote");
  if (formLote) {
    formLote.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(formLote);
      const data = {
        id_picole: formData.get("id_picole"),
        quantidade: formData.get("quantidade"),
      };

      try {
        const response = await fetch(
          API_BASE + "api_producao.php?action=criar-lote",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );

        const result = await response.json();

        if (result.success) {
          alert("✅ " + result.message);
          formLote.reset();
          await carregarLotes();
        } else {
          alert("❌ " + result.message);
        }
      } catch (error) {
        console.error("❌ Erro:", error);
        alert("❌ Erro ao criar lote.");
      }
    });
  }
}

// ====================================
// CONFIGURAR BOTÕES
// ====================================
function configurarBotoes() {
  // Botão Limpar Picolé
  const btnLimparPicole = document.getElementById("btn-limpar-picole");
  if (btnLimparPicole) {
    btnLimparPicole.addEventListener("click", () => {
      document.getElementById("form-picole").reset();
    });
  }

  // Botão Limpar Lote
  const btnLimparLote = document.getElementById("btn-limpar-lote");
  if (btnLimparLote) {
    btnLimparLote.addEventListener("click", () => {
      document.getElementById("form-lote").reset();
    });
  }
}

// ====================================
// CONFIGURAR FILTROS
// ====================================
function configurarFiltros() {
  const filterTipo = document.getElementById("filter-tipo-lote");
  if (filterTipo) {
    filterTipo.addEventListener("change", filtrarLotes);
  }

  const buscaPicole = document.getElementById("search-picole");
  if (buscaPicole) {
    buscaPicole.addEventListener("input", buscarPicoles);
  }
}

// ====================================
// FILTRAR LOTES
// ====================================
async function filtrarLotes() {
  try {
    const filterTipo = document.getElementById("filter-tipo-lote")?.value || "";

    const response = await fetch(
      API_BASE + "api_producao.php?action=listar-lotes"
    );
    let lotes = await response.json();

    // Aplicar filtro
    if (filterTipo) {
      lotes = lotes.filter((l) => l.id_tipo_picole == filterTipo);
    }

    const tbody = document.getElementById("table-lotes");
    if (tbody) {
      if (lotes.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="6" class="text-center text-muted">Nenhum lote encontrado</td></tr>';
      } else {
        tbody.innerHTML = lotes
          .map((l) => {
            const statusClass = l.status === "ATIVO" ? "success" : "danger";
            return `
            <tr>
              <td>${l.id}</td>
              <td>${l.tipo_nome}</td>
              <td>${l.quantidade_total}</td>
              <td>${l.quantidade_disponivel}</td>
              <td><span class="badge badge-${statusClass}">${l.status}</span></td>
              <td>
                <button class="btn btn-secondary btn-sm" onclick="verDetalhesLote(${l.id})">
                  👁️ Ver
                </button>
              </td>
            </tr>
          `;
          })
          .join("");
      }
    }
  } catch (error) {
    console.error("❌ Erro ao filtrar lotes:", error);
  }
}

// ====================================
// BUSCAR PICOLÉS
// ====================================
async function buscarPicoles() {
  try {
    const termoBusca =
      document.getElementById("search-picole")?.value.toLowerCase() || "";

    const response = await fetch(
      API_BASE + "api_producao.php?action=listar-picoles"
    );
    let picoles = await response.json();

    if (termoBusca) {
      picoles = picoles.filter(
        (p) =>
          p.sabor_nome.toLowerCase().includes(termoBusca) ||
          p.tipo_nome.toLowerCase().includes(termoBusca)
      );
    }

    const tbody = document.getElementById("table-picoles");
    if (tbody) {
      if (picoles.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="6" class="text-center text-muted">Nenhum picolé encontrado</td></tr>';
      } else {
        tbody.innerHTML = picoles
          .map(
            (p) => `
          <tr>
            <td>${p.id}</td>
            <td>${p.sabor_nome}</td>
            <td>${p.tipo_nome}</td>
            <td>${p.embalagem_nome}</td>
            <td>R$ ${parseFloat(p.preco).toFixed(2)}</td>
            <td>
              <button class="btn btn-danger btn-sm" onclick="deletarPicole(${
                p.id
              })">
                🗑️ Excluir
              </button>
            </td>
          </tr>
        `
          )
          .join("");
      }
    }
  } catch (error) {
    console.error("❌ Erro ao buscar picolés:", error);
  }
}

// ====================================
// DELETAR PICOLÉ
// ====================================
async function deletarPicole(id) {
  if (!confirm("Tem certeza que deseja excluir este picolé?")) {
    return;
  }

  try {
    const response = await fetch(
      API_BASE + `api_producao.php?action=deletar-picole&id=${id}`,
      {
        method: "DELETE",
      }
    );
    const result = await response.json();

    if (result.success) {
      alert("✅ " + result.message);
      await carregarPicoles();
      await carregarPicolesParaLote();
    } else {
      alert("❌ " + result.message);
    }
  } catch (error) {
    console.error("❌ Erro:", error);
    alert("❌ Erro ao deletar picolé.");
  }
}

// ====================================
// VER DETALHES DO LOTE
// ====================================
function verDetalhesLote(id) {
  alert(`📦 Funcionalidade de detalhes do lote #${id} em desenvolvimento`);
}

// ====================================
// TORNAR FUNÇÕES GLOBAIS
// ====================================
window.deletarPicole = deletarPicole;
window.verDetalhesLote = verDetalhesLote;
window.filtrarLotes = filtrarLotes;
window.buscarPicoles = buscarPicoles;

console.log("✅ Módulo producao.js carregado completamente");

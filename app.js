// app.js - Sistema Principal Corrigido
console.log("🚀 Sistema carregando...");

// ⚠️ ÚNICA declaração de API_BASE (garantir window.API_BASE)
window.API_BASE = window.API_BASE || "./";

// ===========================================
// UTILITÁRIOS
// ===========================================
function mostrarMensagem(mensagem, tipo = "info") {
  console.log(`[${tipo.toUpperCase()}] ${mensagem}`);
  alert(mensagem);
}

function tratarErroAPI(error, contexto = "") {
  console.error(`❌ Erro em ${contexto}:`, error);
  mostrarMensagem(`Erro ao ${contexto}: ${error.message}`, "error");
}

// ===========================================
// CARREGADOR GENÉRICO DE SELECTS
// ===========================================
/**
 * Popula um <select> a partir de um endpoint que retorna array de objetos.
 * @param {string} endpoint - ex: "api_cadastros.php?action=listar-sabores"
 * @param {string} selectId - id do <select> no DOM
 * @param {string} valueKey - chave do objeto que será o value (ex: "id")
 * @param {string} textKey - chave do objeto que será mostrado (ex: "nome")
 * @param {Object} opts - { placeholderText, sortBy, emptyText }
 */
async function carregarSelect(
  endpoint,
  selectId,
  valueKey = "id",
  textKey = "nome",
  opts = {}
) {
  const {
    placeholderText = "Selecione...",
    sortBy = null,
    emptyText = "Nenhum registro encontrado",
  } = opts;

  const sel = document.getElementById(selectId);
  if (!sel) {
    console.warn(`⚠️ Select "${selectId}" não encontrado.`);
    return;
  }

  console.log(`📥 Carregando select "${selectId}" de ${endpoint}`);

  try {
    const res = await fetch(window.API_BASE + endpoint);
    const txt = await res.text();

    let data;
    try {
      data = JSON.parse(txt);
    } catch (e) {
      console.error("❌ Resposta não é JSON válido:", txt);
      sel.innerHTML = `<option value="">Erro ao carregar</option>`;
      return;
    }

    // Suportar payloads { success: true, data: [...] }
    if (!Array.isArray(data) && data && Array.isArray(data.data)) {
      data = data.data;
    }

    if (!Array.isArray(data)) {
      console.error("❌ Dados não são array:", data);
      sel.innerHTML = `<option value="">${emptyText}</option>`;
      return;
    }

    // Ordenar se solicitado
    if (sortBy) {
      data.sort((a, b) => ("" + a[sortBy]).localeCompare("" + b[sortBy]));
    }

    // Gerar options
    const options = data
      .map((item) => {
        const v = item[valueKey] ?? "";
        const t = item[textKey] ?? v;
        return `<option value="${v}">${t}</option>`;
      })
      .join("");

    sel.innerHTML =
      `<option value="">${placeholderText}</option>` +
      (options || `<option value="">${emptyText}</option>`);

    console.log(`✅ Select "${selectId}" populado com ${data.length} items`);
  } catch (err) {
    console.error("❌ Erro ao carregar select:", err);
    sel.innerHTML = `<option value="">Erro ao carregar</option>`;
  }
}

// ===========================================
// SISTEMA DE ABAS
// ===========================================
function inicializarAbas() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  if (tabButtons.length === 0) {
    console.log("ℹ️ Sem abas nesta página");
    return;
  }

  console.log(`📑 Inicializando ${tabButtons.length} abas`);

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab");
      console.log(`🔄 Mudando para aba: ${targetTab}`);

      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      button.classList.add("active");
      const targetContent = document.getElementById(`tab-${targetTab}`);
      if (targetContent) {
        targetContent.classList.add("active");
      }
    });
  });
}

// ===========================================
// CARREGAR DADOS DINÂMICOS
// ===========================================
async function carregarDados(endpoint, elementoId, renderizarFn) {
  console.log(`📥 Carregando dados de: ${endpoint}`);

  const elemento = document.getElementById(elementoId);
  if (!elemento) {
    console.warn(`⚠️ Elemento ${elementoId} não encontrado`);
    return;
  }

  try {
    const response = await fetch(window.API_BASE + endpoint);
    const text = await response.text();

    console.log(`📦 Resposta de ${endpoint}:`, text.substring(0, 100));

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("❌ Erro ao fazer parse JSON:", text);
      throw new Error("Resposta inválida do servidor");
    }

    if (data.error) {
      throw new Error(data.error);
    }

    if (!Array.isArray(data)) {
      console.error("❌ Dados não são array:", data);
      elemento.innerHTML =
        '<tr><td colspan="10" class="text-center" style="color: #ef4444;">Erro: dados inválidos</td></tr>';
      return;
    }

    console.log(`✅ ${data.length} itens carregados de ${endpoint}`);

    if (data.length === 0) {
      elemento.innerHTML =
        '<tr><td colspan="10" class="text-center text-muted">Nenhum registro encontrado</td></tr>';
    } else {
      elemento.innerHTML = data.map(renderizarFn).join("");
    }
  } catch (error) {
    console.error(`❌ Erro ao carregar ${endpoint}:`, error);
    elemento.innerHTML = `<tr><td colspan="10" class="text-center" style="color: #ef4444;">❌ Erro ao carregar: ${error.message}</td></tr>`;
  }
}

// ===========================================
// CARREGAR TODAS AS TABELAS
// ===========================================
function loadDynamicData() {
  console.log("🔄 Carregando dados dinâmicos...");

  if (document.getElementById("form-login")) {
    console.log("ℹ️ Página de login detectada - não carregando tabelas");
    return;
  }

  carregarDados(
    "api_cadastros.php?action=listar-sabores",
    "table-sabores",
    (item) => `
      <tr>
        <td>${item.id}</td>
        <td>${item.nome}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deletarItem('sabor', ${item.id})">
            🗑️ Excluir
          </button>
        </td>
      </tr>
    `
  );

  carregarDados(
    "api_cadastros.php?action=listar-ingredientes",
    "table-ingredientes",
    (item) => `
      <tr>
        <td>${item.id}</td>
        <td>${item.nome}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deletarItem('ingrediente', ${item.id})">
            🗑️ Excluir
          </button>
        </td>
      </tr>
    `
  );

  carregarDados(
    "api_cadastros.php?action=listar-embalagens",
    "table-embalagens",
    (item) => `
      <tr>
        <td>${item.id}</td>
        <td>${item.nome}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deletarItem('embalagem', ${item.id})">
            🗑️ Excluir
          </button>
        </td>
      </tr>
    `
  );

  carregarDados(
    "api_cadastros.php?action=listar-tipos",
    "table-tipos",
    (item) => `
      <tr>
        <td>${item.id}</td>
        <td>${item.nome}</td>
        <td>${item.descricao || "-"}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deletarItem('tipo', ${
            item.id
          })">
            🗑️ Excluir
          </button>
        </td>
      </tr>
    `
  );

  carregarDados(
    "api_cadastros.php?action=listar-aditivos",
    "table-aditivos",
    (item) => `
      <tr>
        <td>${item.id}</td>
        <td>${item.nome}</td>
        <td>${item.formula_quimica || "-"}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deletarItem('aditivo', ${
            item.id
          })">
            🗑️ Excluir
          </button>
        </td>
      </tr>
    `
  );

  carregarDados(
    "api_cadastros.php?action=listar-conservantes",
    "table-conservantes",
    (item) => `
      <tr>
        <td>${item.id}</td>
        <td>${item.nome}</td>
        <td>${item.descricao || "-"}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deletarItem('conservante', ${
            item.id
          })">
            🗑️ Excluir
          </button>
        </td>
      </tr>
    `
  );

  carregarDados(
    "api_cadastros.php?action=listar-revendedores",
    "table-revendedores",
    (item) => `
      <tr>
        <td>${item.id}</td>
        <td>${item.cnpj}</td>
        <td>${item.razao_social}</td>
        <td>${item.contato}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deletarItem('revendedor', ${item.id})">
            🗑️ Excluir
          </button>
        </td>
      </tr>
    `
  );
}

async function deletarItem(tipo, id) {
  console.log(`🗑️ Deletando ${tipo} ID: ${id}`);

  if (!confirm(`Tem certeza que deseja excluir este ${tipo}?`)) {
    return;
  }

  try {
    const response = await fetch(
      `${window.API_BASE}api_cadastros.php?action=deletar-${tipo}&id=${id}`,
      { method: "GET" }
    );

    const text = await response.text();
    console.log("📦 Resposta delete:", text);

    const result = JSON.parse(text);

    if (result.success) {
      mostrarMensagem("✅ " + result.message, "success");
      loadDynamicData();
    } else {
      mostrarMensagem("❌ " + result.message, "error");
    }
  } catch (error) {
    tratarErroAPI(error, "deletar item");
  }
}

window.deletarItem = deletarItem;

// ===========================================
// CONFIGURAR FORMULÁRIOS
// ===========================================
function configurarFormulario(formId, endpoint, mensagemSucesso) {
  const form = document.getElementById(formId);
  if (!form) {
    console.log(`ℹ️ Formulário ${formId} não encontrado nesta página`);
    return;
  }

  console.log(`📝 Configurando formulário: ${formId}`);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log(`📤 Enviando formulário: ${formId}`);

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    console.log("📦 Dados do formulário:", data);

    try {
      const response = await fetch(window.API_BASE + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const text = await response.text();
      console.log("📦 Resposta:", text);

      const result = JSON.parse(text);

      if (result.success) {
        mostrarMensagem("✅ " + (result.message || mensagemSucesso), "success");
        form.reset();

        if (result.redirect) {
          console.log(`🔄 Redirecionando para: ${result.redirect}`);
          setTimeout(() => {
            window.location.href = result.redirect;
          }, 1000);
        } else {
          loadDynamicData();
        }
      } else {
        mostrarMensagem("❌ " + result.message, "error");
      }
    } catch (error) {
      tratarErroAPI(error, "salvar");
    }
  });
}

function setupForms() {
  console.log("📝 Configurando todos os formulários...");

  configurarFormulario(
    "form-login",
    "auth.php?action=login",
    "Login realizado!"
  );
  configurarFormulario(
    "form-sabor",
    "api_cadastros.php?action=salvar-sabor",
    "Sabor cadastrado!"
  );
  configurarFormulario(
    "form-ingrediente",
    "api_cadastros.php?action=salvar-ingrediente",
    "Ingrediente cadastrado!"
  );
  configurarFormulario(
    "form-embalagem",
    "api_cadastros.php?action=salvar-embalagem",
    "Embalagem cadastrada!"
  );
  configurarFormulario(
    "form-tipo",
    "api_cadastros.php?action=salvar-tipo",
    "Tipo cadastrado!"
  );
  configurarFormulario(
    "form-aditivo",
    "api_cadastros.php?action=salvar-aditivo",
    "Aditivo cadastrado!"
  );
  configurarFormulario(
    "form-conservante",
    "api_cadastros.php?action=salvar-conservante",
    "Conservante cadastrado!"
  );
  configurarFormulario(
    "form-revendedor",
    "api_cadastros.php?action=salvar-revendedor",
    "Revendedor cadastrado!"
  );

  console.log("✅ Formulários configurados");
}

// ===========================================
// INICIALIZAÇÃO
// ===========================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM Carregado - Inicializando sistema...");

  inicializarAbas();
  setupForms();
  loadDynamicData();

  console.log("🎉 Sistema inicializado com sucesso!");
});

console.log("📱 app.js carregado - API_BASE:", window.API_BASE);

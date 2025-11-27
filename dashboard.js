// dashboard.js - Carregar dados do Dashboard
const API_BASE = "./";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("📊 Inicializando dashboard...");

  await carregarDadosDashboard();
  configurarPermissoes();
});

// ====================================
// CARREGAR DADOS DO DASHBOARD
// ====================================
async function carregarDadosDashboard() {
  try {
    // Carregar total de picolés
    const responsePicoles = await fetch(
      API_BASE + "api_producao.php?action=listar-picoles"
    );
    const picoles = await responsePicoles.json();
    document.getElementById("total-picoles").textContent = picoles.length;

    // Carregar total de lotes ativos
    const responseLotes = await fetch(
      API_BASE + "api_producao.php?action=listar-lotes"
    );
    const lotes = await responseLotes.json();
    const lotesAtivos = lotes.filter((l) => l.status === "ATIVO");
    document.getElementById("total-lotes").textContent = lotesAtivos.length;

    // Carregar total de revendedores
    const responseRevendedores = await fetch(
      API_BASE + "api_cadastros.php?action=listar-revendedores"
    );
    const revendedores = await responseRevendedores.json();
    document.getElementById("total-revendedores").textContent =
      revendedores.length;

    // Carregar vendas do mês atual
    const ano = new Date().getFullYear();
    const mes = new Date().getMonth() + 1;
    const responseVendas = await fetch(
      API_BASE +
        `api_relatorios.php?action=resumo-estatistico&ano=${ano}&mes=${mes}`
    );
    const vendas = await responseVendas.json();

    const faturamento = parseFloat(vendas.faturamento || 0);
    document.getElementById("total-vendas").textContent = `R$ ${faturamento
      .toFixed(2)
      .replace(".", ",")}`;

    console.log("✅ Dados do dashboard carregados");
  } catch (error) {
    console.error("❌ Erro ao carregar dados do dashboard:", error);
  }
}

// ====================================
// CONFIGURAR PERMISSÕES
// ====================================
function configurarPermissoes() {
  const permissions = JSON.parse(
    localStorage.getItem("userPermissions") || "[]"
  );
  const userName = localStorage.getItem("userName") || "Usuário";

  // Atualizar nome do usuário
  document.getElementById("welcome-user").textContent = userName;
  document.getElementById("user-name").textContent = userName;

  // Mostrar botão de usuários se for admin
  if (permissions.includes("admin")) {
    const navUsuarios = document.getElementById("nav-usuarios");
    if (navUsuarios) {
      navUsuarios.style.display = "flex";
    }
    document.getElementById("user-role-display").textContent = "Administrador";
    document.getElementById("info-role").textContent = "🔐 Administrador";
  } else if (permissions.includes("producao")) {
    document.getElementById("user-role-display").textContent =
      "Equipe de Produção";
    document.getElementById("info-role").textContent = "🏭 Produção";
  } else if (permissions.includes("vendas")) {
    document.getElementById("user-role-display").textContent =
      "Equipe de Vendas";
    document.getElementById("info-role").textContent = "💰 Vendas";
  } else {
    document.getElementById("user-role-display").textContent = "usuário";
    document.getElementById("info-role").textContent = "👤 Usuário Padrão";
  }

  // Mostrar permissões
  const permissionBadges = permissions
    .map((p) => {
      const icons = {
        admin: "🔐",
        dashboard: "📊",
        cadastros: "📝",
        producao: "🏭",
        vendas: "💰",
        relatorios: "📈",
      };
      return `<span style="background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 6px; font-size: 0.9rem; margin-right: 8px; display: inline-block; margin-bottom: 4px;">${
        icons[p] || ""
      } ${p}</span>`;
    })
    .join("");
  document.getElementById("info-permissions").innerHTML = permissionBadges;

  // Carregar ações rápidas baseado nas permissões
  const quickActionsGrid = document.getElementById("quick-actions-grid");
  let actions = "";

  if (permissions.includes("producao")) {
    actions += `
      <a href="producao.html" class="action-card">
        <span class="action-icon">🦴</span>
        <h4>Cadastrar Picolé</h4>
        <p>Adicionar novo tipo de picolé</p>
      </a>
      <a href="producao.html#lotes" class="action-card">
        <span class="action-icon">📦</span>
        <h4>Criar Lote</h4>
        <p>Registrar nova produção</p>
      </a>
    `;
  }

  if (permissions.includes("vendas")) {
    actions += `
      <a href="vendas.html" class="action-card">
        <span class="action-icon">📄</span>
        <h4>Emitir Nota Fiscal</h4>
        <p>Nova venda para revendedor</p>
      </a>
    `;
  }

  if (permissions.includes("cadastros")) {
    actions += `
      <a href="cadastros.html" class="action-card">
        <span class="action-icon">➕</span>
        <h4>Cadastros Gerais</h4>
        <p>Sabores, ingredientes, etc.</p>
      </a>
    `;
  }

  if (permissions.includes("relatorios")) {
    actions += `
      <a href="relatorios.html" class="action-card">
        <span class="action-icon">📊</span>
        <h4>Ver Relatórios</h4>
        <p>Análises e estatísticas</p>
      </a>
    `;
  }

  if (permissions.includes("admin")) {
    actions += `
      <a href="usuarios.html" class="action-card">
        <span class="action-icon">👥</span>
        <h4>Gerenciar Usuários</h4>
        <p>Criar e editar acessos</p>
      </a>
    `;
  }

  quickActionsGrid.innerHTML =
    actions ||
    '<p style="color: #94a3b8;">Você não tem ações rápidas disponíveis.</p>';
}

console.log("✅ dashboard.js carregado");

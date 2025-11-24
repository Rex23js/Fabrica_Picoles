// ====================================
// FILTRAR LOTES
// ====================================
async function filtrarLotes() {
  try {
    const filterTipo = document.getElementById("filter-tipo-lote")?.value || "";
    const filterStatus =
      document.getElementById("filter-status-lote")?.value || "";

    const response = await fetch(
      API_BASE + "api_producao.php?action=listar-lotes"
    );
    let lotes = await response.json();

    // Aplicar filtros
    if (filterTipo) {
      lotes = lotes.filter((l) => l.id_tipo_picole == filterTipo);
    }
    if (filterStatus) {
      lotes = lotes.filter((l) => l.status === filterStatus);
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
                <button class="btn btn-warning btn-sm" onclick="finalizarLote(${l.id})">
                  ✓ Finalizar
                </button>
              </td>
            </tr>
          `;
          })
          .join("");
      }
    }
  } catch (error) {
    console.error("Erro ao filtrar lotes:", error);
  }
}

// ====================================
// FINALIZAR LOTE
// ====================================
async function finalizarLote(id) {
  if (!confirm("Tem certeza que deseja finalizar este lote?")) {
    return;
  }

  try {
    const response = await fetch(
      API_BASE + `api_producao.php?action=finalizar-lote&id=${id}`,
      { method: "POST" }
    );
    const result = await response.json();

    if (result.success) {
      alert("✅ " + result.message);
      await carregarLotes();
    } else {
      alert("❌ " + result.message);
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("❌ Erro ao finalizar lote.");
  }
}

// ====================================
// VER DETALHES DO LOTE (Completo)
// ====================================
async function verDetalhesLote(id) {
  try {
    const response = await fetch(
      API_BASE + `api_producao.php?action=detalhe-lote&id=${id}`
    );
    const lote = await response.json();

    if (lote.success) {
      const details = lote.data;
      alert(
        `📦 Detalhes do Lote #${details.id}\n\n` +
          `Tipo: ${details.tipo_nome}\n` +
          `Total: ${details.quantidade_total} unidades\n` +
          `Disponível: ${details.quantidade_disponivel} unidades\n` +
          `Status: ${details.status}\n` +
          `Data: ${new Date(details.data_criacao).toLocaleDateString("pt-BR")}`
      );
    } else {
      alert("❌ Lote não encontrado");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("❌ Erro ao carregar detalhes.");
  }
}

// ====================================
// BUSCAR PICOLÉS
// ====================================
async function buscarPicoles() {
  try {
    const termoBusca = document.getElementById("busca-picole")?.value || "";
    const response = await fetch(
      API_BASE + "api_producao.php?action=listar-picoles"
    );
    let picoles = await response.json();

    if (termoBusca) {
      picoles = picoles.filter(
        (p) =>
          p.sabor_nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
          p.tipo_nome.toLowerCase().includes(termoBusca.toLowerCase())
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
    console.error("Erro ao buscar picolés:", error);
  }
}

// ====================================
// ADICIONAR LISTENERS DE FILTROS
// ====================================
function configurarFiltros() {
  const filterTipo = document.getElementById("filter-tipo-lote");
  const filterStatus = document.getElementById("filter-status-lote");
  const buscaPicole = document.getElementById("busca-picole");

  if (filterTipo) filterTipo.addEventListener("change", filtrarLotes);
  if (filterStatus) filterStatus.addEventListener("change", filtrarLotes);
  if (buscaPicole) buscaPicole.addEventListener("input", buscarPicoles);
}

// ====================================
// TORNAR FUNÇÕES GLOBAIS
// ====================================
window.deletarPicole = deletarPicole;
window.verDetalhesLote = verDetalhesLote;
window.finalizarLote = finalizarLote;
window.filtrarLotes = filtrarLotes;
window.buscarPicoles = buscarPicoles;

// ====================================
// ATUALIZAR INICIALIZAÇÃO
// ====================================
document.addEventListener("DOMContentLoaded", () => {
  carregarSabores();
  carregarTiposPicole();
  carregarPicolesParaLote();
  carregarEmbalagens();
  carregarIngredientes();
  carregarAditivos();
  carregarConservantes();
  carregarPicoles();
  carregarLotes();
  configurarFormularios();
  configurarFiltros();
});

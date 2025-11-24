// vendas.js - Script completo para a página de vendas

const API_BASE = "./";
let lotesDisponiveis = [];
let contadorLotes = 0;

// ====================================
// INICIALIZAÇÃO
// ====================================
document.addEventListener("DOMContentLoaded", () => {
  carregarDadosVendas();
  configurarFormularioNota();
  configurarBotoes();
  setDataAtual();
});

// ====================================
// CARREGAR DADOS INICIAIS
// ====================================
async function carregarDadosVendas() {
  await carregarRevendedores();
  await carregarLotesAtivos();
  await carregarNotasFiscais();
}

// ====================================
// CARREGAR REVENDEDORES
// ====================================
async function carregarRevendedores() {
  try {
    const response = await fetch(
      API_BASE + "api_cadastros.php?action=listar-revendedores"
    );
    const revendedores = await response.json();

    // Select principal
    const selectRevendedor = document.getElementById("nota-revendedor");
    if (selectRevendedor) {
      selectRevendedor.innerHTML =
        '<option value="">Selecione o revendedor</option>' +
        revendedores
          .map(
            (r) =>
              `<option value="${r.id}">${r.razao_social} (${r.cnpj})</option>`
          )
          .join("");
    }

    // Filtro
    const filterRevendedor = document.getElementById("filter-revendedor");
    if (filterRevendedor) {
      filterRevendedor.innerHTML =
        '<option value="">Todos os revendedores</option>' +
        revendedores
          .map((r) => `<option value="${r.id}">${r.razao_social}</option>`)
          .join("");
    }
  } catch (error) {
    console.error("Erro ao carregar revendedores:", error);
  }
}

// ====================================
// CARREGAR LOTES ATIVOS
// ====================================
async function carregarLotesAtivos() {
  try {
    const response = await fetch(
      API_BASE + "api_producao.php?action=listar-lotes-ativos"
    );
    lotesDisponiveis = await response.json();
  } catch (error) {
    console.error("Erro ao carregar lotes:", error);
  }
}

// ====================================
// CARREGAR NOTAS FISCAIS
// ====================================
async function carregarNotasFiscais() {
  try {
    const response = await fetch(
      API_BASE + "api_vendas.php?action=listar-notas"
    );
    const notas = await response.json();

    const tbody = document.getElementById("table-notas-fiscais");
    if (tbody) {
      if (notas.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="6" class="text-center text-muted">Nenhuma nota fiscal emitida</td></tr>';
      } else {
        tbody.innerHTML = notas
          .map(
            (n) => `
          <tr>
            <td>${n.id}</td>
            <td>${n.numero_serie}</td>
            <td>${formatarData(n.data_emissao)}</td>
            <td>${n.revendedor_nome}</td>
            <td>R$ ${parseFloat(n.valor_total).toFixed(2)}</td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="verDetalhesNota(${
                n.id
              })">
                👁️ Ver
              </button>
            </td>
          </tr>
        `
          )
          .join("");
      }
    }
  } catch (error) {
    console.error("Erro ao carregar notas:", error);
  }
}

// ====================================
// CONFIGURAR FORMULÁRIO DE NOTA
// ====================================
function configurarFormularioNota() {
  const formNota = document.getElementById("form-nota-fiscal");
  if (formNota) {
    formNota.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Validar se tem lotes
      const lotes = document.querySelectorAll(".lote-item");
      if (lotes.length === 0) {
        alert("❌ Adicione pelo menos um lote à nota fiscal!");
        return;
      }

      // Coletar dados
      const formData = new FormData(formNota);
      const itens = [];

      lotes.forEach((loteItem) => {
        const selectLote = loteItem.querySelector(".lote-select");
        const inputQtd = loteItem.querySelector(".lote-quantidade");

        if (selectLote.value && inputQtd.value) {
          const lote = lotesDisponiveis.find((l) => l.id == selectLote.value);
          itens.push({
            id_lote: selectLote.value,
            quantidade: parseInt(inputQtd.value),
            valor_unitario: parseFloat(lote.preco_unitario),
          });
        }
      });

      if (itens.length === 0) {
        alert("❌ Preencha todos os dados dos lotes!");
        return;
      }

      const data = {
        numero_serie: formData.get("numero_serie"),
        data_emissao: formData.get("data_emissao"),
        id_revendedor: formData.get("id_revendedor"),
        descricao: formData.get("descricao"),
        itens: itens,
      };

      try {
        const response = await fetch(
          API_BASE + "api_vendas.php?action=salvar-venda",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );
        const result = await response.json();

        if (result.success) {
          alert("✅ " + result.message);
          formNota.reset();
          document.getElementById("lista-lotes-nota").innerHTML = "";
          contadorLotes = 0;
          setDataAtual();
          await carregarNotasFiscais();
          await carregarLotesAtivos();
        } else {
          alert("❌ " + result.message);
        }
      } catch (error) {
        console.error("Erro:", error);
        alert("❌ Erro ao processar venda.");
      }
    });
  }
}

// ====================================
// CONFIGURAR BOTÕES
// ====================================
function configurarBotoes() {
  // Botão adicionar lote
  const btnAdicionar = document.getElementById("btn-adicionar-lote");
  if (btnAdicionar) {
    btnAdicionar.addEventListener("click", adicionarLote);
  }

  // Botão cancelar
  const btnCancelar = document.getElementById("btn-cancelar-nota");
  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      if (confirm("Deseja realmente cancelar esta nota?")) {
        document.getElementById("form-nota-fiscal").reset();
        document.getElementById("lista-lotes-nota").innerHTML = "";
        contadorLotes = 0;
        setDataAtual();
        atualizarValorTotal();
      }
    });
  }
}

// ====================================
// ADICIONAR LOTE À NOTA
// ====================================
function adicionarLote() {
  const template = document.getElementById("template-lote-item");
  const clone = template.content.cloneNode(true);

  // Preencher select com lotes disponíveis
  const selectLote = clone.querySelector(".lote-select");
  selectLote.innerHTML =
    '<option value="">Selecione o lote</option>' +
    lotesDisponiveis
      .map(
        (l) =>
          `<option value="${l.id}" data-disponivel="${l.quantidade_disponivel}" data-preco="${l.preco_unitario}">
          Lote #${l.id} - ${l.tipo_nome} (${l.sabor_nome}) - Disp: ${l.quantidade_disponivel}
        </option>`
      )
      .join("");

  // Event listeners
  selectLote.addEventListener("change", function () {
    const option = this.options[this.selectedIndex];
    if (option.value) {
      const loteItem = this.closest(".lote-item");
      loteItem.querySelector(".lote-disponivel").value =
        option.dataset.disponivel;
      loteItem.querySelector(".lote-valor-unit").value =
        "R$ " + parseFloat(option.dataset.preco).toFixed(2);

      // Resetar quantidade
      loteItem.querySelector(".lote-quantidade").value = "";
      loteItem.querySelector(".lote-subtotal").value = "";
    }
  });

  const inputQtd = clone.querySelector(".lote-quantidade");
  inputQtd.addEventListener("input", function () {
    const loteItem = this.closest(".lote-item");
    calcularSubtotal(loteItem);
  });

  const btnRemove = clone.querySelector(".btn-remove-lote");
  btnRemove.addEventListener("click", function () {
    this.closest(".lote-item").remove();
    atualizarValorTotal();
  });

  document.getElementById("lista-lotes-nota").appendChild(clone);
  contadorLotes++;
}

// ====================================
// CALCULAR SUBTOTAL DO LOTE
// ====================================
function calcularSubtotal(loteItem) {
  const selectLote = loteItem.querySelector(".lote-select");
  const inputQtd = loteItem.querySelector(".lote-quantidade");
  const inputDisponivel = loteItem.querySelector(".lote-disponivel");
  const inputSubtotal = loteItem.querySelector(".lote-subtotal");

  if (!selectLote.value) {
    alert("❌ Selecione um lote primeiro!");
    inputQtd.value = "";
    return;
  }

  const quantidade = parseInt(inputQtd.value) || 0;
  const disponivel = parseInt(inputDisponivel.value) || 0;

  if (quantidade > disponivel) {
    alert(`❌ Quantidade maior que o disponível (${disponivel})!`);
    inputQtd.value = "";
    inputSubtotal.value = "";
    return;
  }

  const option = selectLote.options[selectLote.selectedIndex];
  const preco = parseFloat(option.dataset.preco) || 0;
  const subtotal = quantidade * preco;

  inputSubtotal.value = "R$ " + subtotal.toFixed(2);
  atualizarValorTotal();
}

// ====================================
// ATUALIZAR VALOR TOTAL DA NOTA
// ====================================
function atualizarValorTotal() {
  let total = 0;
  document.querySelectorAll(".lote-item").forEach((item) => {
    const subtotalText = item.querySelector(".lote-subtotal").value;
    const subtotal =
      parseFloat(subtotalText.replace("R$ ", "").replace(",", ".")) || 0;
    total += subtotal;
  });

  document.getElementById("nota-valor-total").textContent = total.toFixed(2);
}

// ====================================
// FUNÇÕES AUXILIARES
// ====================================
function setDataAtual() {
  const inputData = document.getElementById("nota-data");
  if (inputData) {
    inputData.value = new Date().toISOString().split("T")[0];
  }

  const inputSerie = document.getElementById("nota-numero-serie");
  if (inputSerie && !inputSerie.value) {
    inputSerie.value = "NF" + Date.now();
  }
}

function formatarData(dataStr) {
  const data = new Date(dataStr);
  return data.toLocaleDateString("pt-BR");
}

function verDetalhesNota(id) {
  // TODO: Implementar modal de detalhes
  alert("Funcionalidade de detalhes em desenvolvimento");
}

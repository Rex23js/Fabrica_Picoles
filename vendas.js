// vendas.js - Sistema Completo de Vendas CORRIGIDO
const API_BASE = "./";
let lotesDisponiveis = [];
let contadorLotes = 0;

// ====================================
// INICIALIZAÇÃO
// ====================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("💰 Inicializando módulo de vendas...");
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

    console.log("📋 Revendedores carregados:", revendedores);

    // Select principal do formulário
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
      console.log(
        `✅ ${revendedores.length} revendedores carregados no select`
      );
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
    console.error("❌ Erro ao carregar revendedores:", error);
    alert(
      "❌ Erro ao carregar revendedores. Verifique se eles estão cadastrados."
    );
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

    const text = await response.text();
    console.log("📦 Resposta raw lotes:", text);

    lotesDisponiveis = JSON.parse(text);

    console.log("📦 Lotes ativos:", lotesDisponiveis);
    console.log(`✅ ${lotesDisponiveis.length} lotes ativos carregados`);

    if (lotesDisponiveis.length === 0) {
      console.warn("⚠️ Nenhum lote ativo disponível para venda");
    }
  } catch (error) {
    console.error("❌ Erro ao carregar lotes:", error);
    alert("❌ Erro ao carregar lotes disponíveis.");
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
      console.log(`✅ ${notas.length} notas fiscais carregadas`);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar notas:", error);
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

      console.log("📤 Enviando venda:", data);

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
          atualizarValorTotal();
          await carregarNotasFiscais();
          await carregarLotesAtivos();
        } else {
          alert("❌ " + result.message);
        }
      } catch (error) {
        console.error("❌ Erro:", error);
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

  // Botão filtrar
  const btnFiltrar = document.getElementById("btn-filtrar");
  if (btnFiltrar) {
    btnFiltrar.addEventListener("click", filtrarNotas);
  }
}

// ====================================
// ADICIONAR LOTE À NOTA
// ====================================
function adicionarLote() {
  if (lotesDisponiveis.length === 0) {
    alert(
      "❌ Não há lotes disponíveis para venda. Crie lotes na área de Produção primeiro."
    );
    return;
  }

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
        Lote #${l.id} - ${l.picole_nome} - Disp: ${l.quantidade_disponivel}
      </option>`
      )
      .join("");

  // Event listener para mudança de lote
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

  // Event listener para quantidade
  const inputQtd = clone.querySelector(".lote-quantidade");
  inputQtd.addEventListener("input", function () {
    const loteItem = this.closest(".lote-item");
    calcularSubtotal(loteItem);
  });

  // Event listener para remover
  const btnRemove = clone.querySelector(".btn-remove-lote");
  btnRemove.addEventListener("click", function () {
    this.closest(".lote-item").remove();
    atualizarValorTotal();
  });

  document.getElementById("lista-lotes-nota").appendChild(clone);
  contadorLotes++;
  console.log(`➕ Lote adicionado (total: ${contadorLotes})`);
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
  console.log(`💵 Valor total atualizado: R$ ${total.toFixed(2)}`);
}

// ====================================
// FILTRAR NOTAS
// ====================================
async function filtrarNotas() {
  try {
    const dataInicio = document.getElementById("filter-data-inicio").value;
    const dataFim = document.getElementById("filter-data-fim").value;
    const revendedor = document.getElementById("filter-revendedor").value;

    const response = await fetch(
      API_BASE + "api_vendas.php?action=listar-notas"
    );
    let notas = await response.json();

    // Aplicar filtros
    if (dataInicio) {
      notas = notas.filter((n) => n.data_emissao >= dataInicio);
    }
    if (dataFim) {
      notas = notas.filter((n) => n.data_emissao <= dataFim);
    }
    if (revendedor) {
      notas = notas.filter((n) => n.id_revendedor == revendedor);
    }

    const tbody = document.getElementById("table-notas-fiscais");
    if (notas.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="text-center text-muted">Nenhuma nota encontrada</td></tr>';
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
  } catch (error) {
    console.error("❌ Erro ao filtrar:", error);
  }
}

// ====================================
// VER DETALHES DA NOTA
// ====================================
async function verDetalhesNota(id) {
  try {
    const response = await fetch(
      API_BASE + `api_vendas.php?action=detalhes-nota&id=${id}`
    );
    const data = await response.json();

    if (data.error) {
      alert("❌ " + data.error);
      return;
    }

    const nota = data.nota;
    const itens = data.itens;

    let html = `
      <div style="padding: 1rem;">
        <h4 style="margin-bottom: 1rem; color: #4f46e5;">📄 Nota Fiscal #${
          nota.numero_serie
        }</h4>
        
        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            <div>
              <strong style="color: #64748b;">Data de Emissão:</strong>
              <p style="margin: 0.25rem 0 0 0;">${formatarData(
                nota.data_emissao
              )}</p>
            </div>
            <div>
              <strong style="color: #64748b;">Valor Total:</strong>
              <p style="margin: 0.25rem 0 0 0; color: #10b981; font-size: 1.2rem; font-weight: 600;">R$ ${parseFloat(
                nota.valor_total
              ).toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
          <strong style="color: #64748b;">Revendedor:</strong>
          <p style="margin: 0.25rem 0 0 0;">${nota.razao_social}</p>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; color: #64748b;">CNPJ: ${
            nota.cnpj
          }</p>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; color: #64748b;">Contato: ${
            nota.contato
          }</p>
        </div>
        
        <h5 style="margin: 1.5rem 0 0.5rem 0;">Itens da Nota:</h5>
        <table class="table" style="margin-top: 0.5rem;">
          <thead>
            <tr>
              <th>Lote</th>
              <th>Picolé</th>
              <th>Qtd</th>
              <th>Valor Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itens
              .map(
                (item) => `
              <tr>
                <td>#${item.id_lote}</td>
                <td>${item.tipo_nome} - ${item.sabor_nome}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${parseFloat(item.valor_unitario).toFixed(2)}</td>
                <td>R$ ${parseFloat(item.subtotal).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById("modal-nota-body").innerHTML = html;
    document.getElementById("modal-detalhes-nota").classList.add("active");
  } catch (error) {
    console.error("❌ Erro:", error);
    alert("❌ Erro ao carregar detalhes da nota.");
  }
}

// ====================================
// FECHAR MODAL
// ====================================
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-close") || e.target.dataset.close) {
    const modalId = e.target.dataset.close || e.target.closest(".modal").id;
    document.getElementById(modalId)?.classList.remove("active");
  }
});

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

// ====================================
// TORNAR FUNÇÕES GLOBAIS
// ====================================
window.verDetalhesNota = verDetalhesNota;
window.adicionarLote = adicionarLote;
window.filtrarNotas = filtrarNotas;

console.log("✅ Módulo vendas.js carregado completamente");

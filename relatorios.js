// relatorios.js - Sistema de Relatórios Completo com Chart.js
const API_BASE = "./";

// Variáveis globais para os gráficos
let chartVendasMensais = null;
let chartTopRevendedores = null;
let chartDistribuicaoTipos = null;
let chartEvolucaoVendas = null;

// ====================================
// INICIALIZAÇÃO
// ====================================
document.addEventListener("DOMContentLoaded", () => {
  carregarFiltros();
  carregarRelatorios();
  configurarEventos();

  // Configurar ano atual no filtro
  document.getElementById("filter-ano").value = new Date().getFullYear();
});

// ====================================
// CARREGAR FILTROS
// ====================================
async function carregarFiltros() {
  try {
    const response = await fetch(
      API_BASE + "api_cadastros.php?action=listar-tipos"
    );
    const tipos = await response.json();

    const filterTipo = document.getElementById("filter-tipo-picole");
    if (filterTipo) {
      filterTipo.innerHTML =
        '<option value="">Todos</option>' +
        tipos.map((t) => `<option value="${t.id}">${t.nome}</option>`).join("");
    }
  } catch (error) {
    console.error("Erro ao carregar filtros:", error);
  }
}

// ====================================
// CONFIGURAR EVENTOS
// ====================================
function configurarEventos() {
  const btnAtualizar = document.getElementById("btn-atualizar-relatorios");
  if (btnAtualizar) {
    btnAtualizar.addEventListener("click", carregarRelatorios);
  }

  const rankingCriterio = document.getElementById("ranking-criterio");
  if (rankingCriterio) {
    rankingCriterio.addEventListener("change", () => {
      const ano = document.getElementById("filter-ano").value;
      carregarTopRevendedores(ano, rankingCriterio.value);
    });
  }

  const btnExportar = document.getElementById("btn-exportar-excel");
  if (btnExportar) {
    btnExportar.addEventListener("click", exportarParaExcel);
  }
}

// ====================================
// CARREGAR TODOS OS RELATÓRIOS
// ====================================
async function carregarRelatorios() {
  const ano = document.getElementById("filter-ano").value;
  const mes = document.getElementById("filter-mes").value;
  const tipo = document.getElementById("filter-tipo-picole").value;

  // Mostrar indicador de carregamento
  console.log("📊 Carregando relatórios...");

  await Promise.all([
    carregarResumoEstatistico(ano, mes),
    carregarVendasMensaisPorTipo(ano),
    carregarTopRevendedores(ano, "valor"),
    carregarDistribuicaoTipos(ano, mes),
    carregarEvolucaoVendas(),
    carregarDetalhamentoVendas(ano, mes, tipo),
    carregarTopRevendedoresTabela(ano),
  ]);

  console.log("✅ Relatórios carregados!");
}

// ====================================
// RESUMO ESTATÍSTICO
// ====================================
async function carregarResumoEstatistico(ano, mes) {
  try {
    let url = `${API_BASE}api_relatorios.php?action=resumo-estatistico&ano=${ano}`;
    if (mes) url += `&mes=${mes}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("Erro:", data.error);
      return;
    }

    document.getElementById("stat-faturamento").textContent = `R$ ${parseFloat(
      data.faturamento || 0
    ).toFixed(2)}`;
    document.getElementById("stat-lotes").textContent = data.total_lotes || 0;
    document.getElementById("stat-notas").textContent = data.total_notas || 0;
    document.getElementById("stat-melhor-revendedor").textContent =
      data.melhor_revendedor || "N/A";
  } catch (error) {
    console.error("Erro ao carregar resumo:", error);
  }
}

// ====================================
// GRÁFICO: VENDAS MENSAIS POR TIPO
// ====================================
async function carregarVendasMensaisPorTipo(ano) {
  try {
    const response = await fetch(
      `${API_BASE}api_relatorios.php?action=vendas-mensais-tipo&ano=${ano}`
    );
    const dados = await response.json();

    if (dados.error) {
      console.error("Erro:", dados.error);
      return;
    }

    // Organizar dados por mês e tipo
    const meses = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    // Agrupar por tipo
    const dadosPorTipo = {};
    dados.forEach((item) => {
      if (!dadosPorTipo[item.tipo_picole]) {
        dadosPorTipo[item.tipo_picole] = Array(12).fill(0);
      }
      dadosPorTipo[item.tipo_picole][item.mes - 1] = parseFloat(item.valor);
    });

    // Criar datasets
    const datasets = Object.keys(dadosPorTipo).map((tipo, index) => {
      const cores = [
        { bg: "rgba(59, 130, 246, 0.2)", border: "rgb(59, 130, 246)" },
        { bg: "rgba(16, 185, 129, 0.2)", border: "rgb(16, 185, 129)" },
        { bg: "rgba(245, 158, 11, 0.2)", border: "rgb(245, 158, 11)" },
      ];
      const cor = cores[index % cores.length];

      return {
        label: tipo,
        data: dadosPorTipo[tipo],
        backgroundColor: cor.bg,
        borderColor: cor.border,
        borderWidth: 2,
        tension: 0.4,
      };
    });

    // Destruir gráfico anterior se existir
    if (chartVendasMensais) {
      chartVendasMensais.destroy();
    }

    // Criar novo gráfico
    const ctx = document.getElementById("chart-vendas-mensais");
    if (ctx) {
      chartVendasMensais = new Chart(ctx, {
        type: "line",
        data: {
          labels: meses,
          datasets: datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
            title: {
              display: false,
            },
            tooltip: {
              mode: "index",
              intersect: false,
              callbacks: {
                label: function (context) {
                  return (
                    context.dataset.label +
                    ": R$ " +
                    context.parsed.y.toFixed(2)
                  );
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return "R$ " + value.toFixed(0);
                },
              },
            },
          },
        },
      });
    }
  } catch (error) {
    console.error("Erro ao carregar vendas mensais:", error);
  }
}

// ====================================
// GRÁFICO: TOP REVENDEDORES
// ====================================
async function carregarTopRevendedores(ano, criterio) {
  try {
    const response = await fetch(
      `${API_BASE}api_relatorios.php?action=top-revendedores&ano=${ano}&criterio=${criterio}&limit=10`
    );
    const dados = await response.json();

    if (dados.error) {
      console.error("Erro:", dados.error);
      return;
    }

    const labels = dados.map((r) => r.razao_social.substring(0, 20) + "...");
    const valores = dados.map((r) =>
      criterio === "quantidade"
        ? parseInt(r.total_quantidade)
        : parseFloat(r.total_valor)
    );

    if (chartTopRevendedores) {
      chartTopRevendedores.destroy();
    }

    const ctx = document.getElementById("chart-top-revendedores");
    if (ctx) {
      chartTopRevendedores = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: criterio === "quantidade" ? "Quantidade" : "Valor (R$)",
              data: valores,
              backgroundColor: "rgba(139, 92, 246, 0.6)",
              borderColor: "rgb(139, 92, 246)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y",
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.dataset.label || "";
                  const value = context.parsed.x;
                  return (
                    label +
                    ": " +
                    (criterio === "quantidade"
                      ? value.toLocaleString()
                      : "R$ " + value.toFixed(2))
                  );
                },
              },
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return criterio === "quantidade"
                    ? value
                    : "R$ " + value.toFixed(0);
                },
              },
            },
          },
        },
      });
    }
  } catch (error) {
    console.error("Erro ao carregar top revendedores:", error);
  }
}

// ====================================
// GRÁFICO: DISTRIBUIÇÃO POR TIPO
// ====================================
async function carregarDistribuicaoTipos(ano, mes) {
  try {
    let url = `${API_BASE}api_relatorios.php?action=distribuicao-tipos&ano=${ano}`;
    if (mes) url += `&mes=${mes}`;

    const response = await fetch(url);
    const dados = await response.json();

    if (dados.error) {
      console.error("Erro:", dados.error);
      return;
    }

    const labels = dados.map((d) => d.tipo);
    const valores = dados.map((d) => parseFloat(d.valor));

    if (chartDistribuicaoTipos) {
      chartDistribuicaoTipos.destroy();
    }

    const ctx = document.getElementById("chart-distribuicao-tipos");
    if (ctx) {
      chartDistribuicaoTipos = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [
            {
              data: valores,
              backgroundColor: [
                "rgba(59, 130, 246, 0.8)",
                "rgba(16, 185, 129, 0.8)",
                "rgba(245, 158, 11, 0.8)",
                "rgba(239, 68, 68, 0.8)",
              ],
              borderColor: [
                "rgb(59, 130, 246)",
                "rgb(16, 185, 129)",
                "rgb(245, 158, 11)",
                "rgb(239, 68, 68)",
              ],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label || "";
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    }
  } catch (error) {
    console.error("Erro ao carregar distribuição:", error);
  }
}

// ====================================
// GRÁFICO: EVOLUÇÃO DE VENDAS (12 MESES)
// ====================================
async function carregarEvolucaoVendas() {
  try {
    const response = await fetch(
      `${API_BASE}api_relatorios.php?action=evolucao-vendas`
    );
    const dados = await response.json();

    if (dados.error) {
      console.error("Erro:", dados.error);
      return;
    }

    const labels = dados.map((d) => {
      const [ano, mes] = d.mes_ano.split("-");
      const meses = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ];
      return `${meses[parseInt(mes) - 1]}/${ano.substring(2)}`;
    });
    const valores = dados.map((d) => parseFloat(d.valor));

    if (chartEvolucaoVendas) {
      chartEvolucaoVendas.destroy();
    }

    const ctx = document.getElementById("chart-evolucao-vendas");
    if (ctx) {
      chartEvolucaoVendas = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Faturamento Mensal",
              data: valores,
              backgroundColor: "rgba(245, 158, 11, 0.2)",
              borderColor: "rgb(245, 158, 11)",
              borderWidth: 2,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return "R$ " + context.parsed.y.toFixed(2);
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return "R$ " + value.toFixed(0);
                },
              },
            },
          },
        },
      });
    }
  } catch (error) {
    console.error("Erro ao carregar evolução:", error);
  }
}

// ====================================
// TABELA: DETALHAMENTO DE VENDAS
// ====================================
async function carregarDetalhamentoVendas(ano, mes, tipo) {
  try {
    let url = `${API_BASE}api_relatorios.php?action=detalhamento-vendas&ano=${ano}`;
    if (mes) url += `&mes=${mes}`;
    if (tipo) url += `&tipo_picole=${tipo}`;

    const response = await fetch(url);
    const dados = await response.json();

    const tbody = document.getElementById("table-detalhamento");
    if (tbody) {
      if (dados.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="6" class="text-center text-muted">Nenhum dado disponível</td></tr>';
      } else {
        tbody.innerHTML = dados
          .map((d) => {
            const meses = [
              "Janeiro",
              "Fevereiro",
              "Março",
              "Abril",
              "Maio",
              "Junho",
              "Julho",
              "Agosto",
              "Setembro",
              "Outubro",
              "Novembro",
              "Dezembro",
            ];
            return `
            <tr>
              <td>${d.ano}</td>
              <td>${meses[d.mes - 1]}</td>
              <td>${d.tipo_picole}</td>
              <td>${d.total_notas}</td>
              <td>${d.lotes_vendidos}</td>
              <td>R$ ${parseFloat(d.valor_total).toFixed(2)}</td>
            </tr>
          `;
          })
          .join("");
      }
    }
  } catch (error) {
    console.error("Erro ao carregar detalhamento:", error);
  }
}

// ====================================
// TABELA: TOP REVENDEDORES DETALHADO
// ====================================
async function carregarTopRevendedoresTabela(ano) {
  try {
    const response = await fetch(
      `${API_BASE}api_relatorios.php?action=top-revendedores&ano=${ano}&criterio=valor&limit=10`
    );
    const dados = await response.json();

    const tbody = document.getElementById("table-top-revendedores");
    if (tbody) {
      if (dados.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="6" class="text-center text-muted">Nenhum dado disponível</td></tr>';
      } else {
        tbody.innerHTML = dados
          .map(
            (r, index) => `
          <tr>
            <td><strong>${index + 1}º</strong></td>
            <td>${r.cnpj}</td>
            <td>${r.razao_social}</td>
            <td>${r.total_compras}</td>
            <td>${parseInt(r.total_quantidade).toLocaleString()}</td>
            <td>R$ ${parseFloat(r.total_valor).toFixed(2)}</td>
          </tr>
        `
          )
          .join("");
      }
    }
  } catch (error) {
    console.error("Erro ao carregar top revendedores tabela:", error);
  }
}

// ====================================
// EXPORTAR PARA EXCEL
// ====================================
function exportarParaExcel() {
  alert(
    "⚠️ Funcionalidade de exportação em desenvolvimento.\n\nEm breve você poderá exportar os relatórios para Excel!"
  );

  // TODO: Implementar exportação real usando uma biblioteca como SheetJS
  // Exemplo básico de como seria:
  /*
  const tabela = document.getElementById('table-detalhamento');
  const wb = XLSX.utils.table_to_book(tabela);
  XLSX.writeFile(wb, 'relatorio-vendas.xlsx');
  */
}

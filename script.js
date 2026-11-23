const formulario = document.getElementById("formCadastro");
const campoCep = document.getElementById("cep");
const statusCep = document.getElementById("statusCep");
const mensagem = document.getElementById("mensagem");

const CAMPOS = [
  "nome", "email", "cep", "rua", "bairro",
  "cidade", "estado", "numero", "complemento"
];

const CHAVE_STORAGE = "cadastroUsuario";

// Salva todos os campos no localStorage.
function salvarDados() {
  const dados = {};

  CAMPOS.forEach((id) => {
    dados[id] = document.getElementById(id).value;
  });

  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(dados));
}

// Restaura os campos que foram salvos anteriormente.
function restaurarDados() {
  const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

  if (!dadosSalvos) return;

  try {
    const dados = JSON.parse(dadosSalvos);

    CAMPOS.forEach((id) => {
      if (typeof dados[id] === "string") {
        document.getElementById(id).value = dados[id];
      }
    });

    // Se já havia um CEP válido salvo, consulta novamente para preencher o endereço.
    const cep = dados.cep ? dados.cep.replace(/\D/g, "") : "";
    if (cep.length === 8) {
      buscarEndereco(cep);
    }
  } catch (erro) {
    console.error("Não foi possível recuperar os dados salvos:", erro);
    localStorage.removeItem(CHAVE_STORAGE);
  }
}

// Consulta a API ViaCEP e preenche os campos de endereço.
async function buscarEndereco(cep) {
  statusCep.textContent = "Buscando...";
  statusCep.style.color = "#475569";

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

    if (!resposta.ok) {
      throw new Error("Falha na comunicação com o ViaCEP.");
    }

    const endereco = await resposta.json();

    if (endereco.erro) {
      statusCep.textContent = "CEP não encontrado.";
      return;
    }

    document.getElementById("rua").value = endereco.logradouro || "";
    document.getElementById("bairro").value = endereco.bairro || "";
    document.getElementById("cidade").value = endereco.localidade || "";
    document.getElementById("estado").value = endereco.uf || "";

    statusCep.textContent = "Endereço encontrado!";
    statusCep.style.color = "#166534";
    salvarDados();
  } catch (erro) {
    console.error(erro);
    statusCep.textContent = "Erro ao consultar o CEP.";
    statusCep.style.color = "#b91c1c";
  }
}

// Consulta quando o usuário informa os oito números do CEP.
campoCep.addEventListener("input", () => {
  const cep = campoCep.value.replace(/\D/g, "");

  if (cep.length === 8) {
    buscarEndereco(cep);
  } else {
    statusCep.textContent = "";
  }

  salvarDados();
});

// Salva automaticamente sempre que qualquer campo for alterado.
formulario.addEventListener("input", salvarDados);

// Salva também ao enviar o formulário.
formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  salvarDados();
  mensagem.textContent = "Cadastro salvo neste navegador!";
});

// Restaura os dados assim que o JavaScript é carregado.
restaurarDados();

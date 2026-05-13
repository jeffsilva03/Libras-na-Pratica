const botaoMenu = document.querySelector(".botao-menu");
const menuPrincipal = document.querySelector("#menu-principal");

if (botaoMenu && menuPrincipal) {
    botaoMenu.addEventListener("click", () => {
        const menuAberto = botaoMenu.getAttribute("aria-expanded") === "true";
        botaoMenu.setAttribute("aria-expanded", String(!menuAberto));
        menuPrincipal.classList.toggle("menu-aberto");
    });
}

const anoAtual = document.querySelector("#ano-atual");
if (anoAtual) {
    anoAtual.textContent = new Date().getFullYear();
}

function escaparHtml(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function nomeNivel(nivel) {
    const niveis = {
        iniciante: "Iniciante",
        intermediario: "Intermediário",
        avancado: "Avançado",
    };
    return niveis[nivel] || nivel;
}

function nomeTipo(tipo) {
    const tipos = {
        video: "Vídeo",
        material: "Material",
        tarefa: "Tarefa",
        texto: "Texto",
    };
    return tipos[tipo] || tipo;
}

function iconeTipo(tipo) {
    const icones = {
        video: "icon-circle-play",
        material: "icon-file-text",
        tarefa: "icon-list-checks",
        texto: "icon-book-open-text",
    };
    return icones[tipo] || "icon-file";
}

async function chamarApi(url, opcoes = {}) {
    let resposta;

    try {
        resposta = await fetch(url, {
            credentials: "same-origin",
            ...opcoes,
        });
    } catch (erro) {
        return {
            ok: false,
            mensagem: "Backend não disponível. Para esta parte, abra pelo servidor Python.",
        };
    }

    const dados = await resposta.json().catch(() => ({
        ok: false,
        mensagem: "Resposta inválida do servidor.",
    }));

    if (!resposta.ok && dados.ok !== false) {
        dados.ok = false;
        dados.mensagem = "Não foi possível concluir a ação.";
    }

    return dados;
}

function mostrarMensagem(idElemento, mensagem, tipo = "erro") {
    const elemento = document.querySelector(`#${idElemento}`);
    if (!elemento) return;

    elemento.innerHTML = `
        <div class="aviso aviso-${tipo}">
            <span>${escaparHtml(mensagem)}</span>
        </div>
    `;
}

function conteudoVazio(titulo, texto = "") {
    return `
        <div class="estado-vazio">
            <i class="icon-inbox" aria-hidden="true"></i>
            <h2>${escaparHtml(titulo)}</h2>
            ${texto ? `<p>${escaparHtml(texto)}</p>` : ""}
        </div>
    `;
}

function atualizarContadorConteudos(total) {
    const contador = document.querySelector("#conteudos-total");
    if (contador) contador.textContent = total;
}

async function carregarConteudosPublicos() {
    const lista = document.querySelector("#lista-conteudos");
    if (!lista) return;

    const parametros = new URLSearchParams(window.location.search);
    const nivel = parametros.get("nivel") || "todos";

    document.querySelectorAll(".filtros a").forEach((link) => {
        link.classList.toggle("ativo", link.dataset.nivel === nivel);
    });

    const dados = await chamarApi(`/api/conteudos?nivel=${encodeURIComponent(nivel)}`);

    if (!dados.ok) {
        atualizarContadorConteudos(0);
        lista.innerHTML = conteudoVazio("Não foi possível carregar os conteúdos.", dados.mensagem);
        return;
    }

    atualizarContadorConteudos(dados.conteudos.length);

    if (!dados.conteudos.length) {
        lista.innerHTML = conteudoVazio(
            "Nenhum conteúdo publicado ainda.",
            "Assim que a professora cadastrar materiais no painel, eles aparecerão aqui."
        );
        return;
    }

    lista.innerHTML = dados.conteudos.map((conteudo) => `
        <article class="cartao-conteudo cartao-conteudo-${escaparHtml(conteudo.nivel)}">
            <div class="cartao-conteudo-icone">
                <i class="${escaparHtml(iconeTipo(conteudo.tipo))}" aria-hidden="true"></i>
            </div>
            <div class="linha-meta linha-meta-conteudo">
                <span>${escaparHtml(nomeNivel(conteudo.nivel))}</span>
                <span>${escaparHtml(nomeTipo(conteudo.tipo))}</span>
            </div>
            <h2>${escaparHtml(conteudo.titulo)}</h2>
            <p>${escaparHtml(conteudo.descricao)}</p>
            ${conteudo.texto_conteudo ? `<div class="texto-conteudo">${escaparHtml(conteudo.texto_conteudo)}</div>` : ""}
            <div class="rodape-conteudo">
                <small><i class="icon-user-round" aria-hidden="true"></i> ${escaparHtml(conteudo.nome_professor)}</small>
                ${conteudo.url_recurso ? `<a class="botao botao-pequeno" href="${escaparHtml(conteudo.url_recurso)}" target="_blank" rel="noopener"><i class="icon-external-link" aria-hidden="true"></i> Abrir recurso</a>` : `<span class="conteudo-sem-link"><i class="icon-book-open" aria-hidden="true"></i> Texto na plataforma</span>`}
            </div>
        </article>
    `).join("");
}

function configurarLogin() {
    const formulario = document.querySelector("#form-login");
    if (!formulario) return;

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const dadosFormulario = new FormData(formulario);
        const dados = {
            email: dadosFormulario.get("email"),
            senha: dadosFormulario.get("senha"),
        };

        const resposta = await chamarApi("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
        });

        if (resposta.ok) {
            window.location.href = "/painel";
            return;
        }

        mostrarMensagem("mensagem-login", resposta.mensagem || "Login inválido.", "erro");
    });
}

async function verificarSessaoPainel() {
    const painel = document.querySelector("#form-conteudo");
    if (!painel) return false;

    const sessao = await chamarApi("/api/sessao");
    if (!sessao.logado) {
        window.location.href = "/login";
        return false;
    }

    const nomeProfessor = document.querySelector("#painel-professor");
    if (nomeProfessor && sessao.professor?.nome) {
        nomeProfessor.textContent = sessao.professor.nome;
    }

    return true;
}

function atualizarResumoPainel(conteudos = []) {
    const total = conteudos.length;
    const publicados = conteudos.filter((conteudo) => conteudo.publicado).length;
    const rascunhos = total - publicados;

    const campos = {
        "#painel-total": total,
        "#painel-publicados": publicados,
        "#painel-rascunhos": rascunhos,
    };

    Object.entries(campos).forEach(([seletor, valor]) => {
        const elemento = document.querySelector(seletor);
        if (elemento) elemento.textContent = valor;
    });
}

async function carregarPainel() {
    const lista = document.querySelector("#lista-admin");
    if (!lista) return;

    const sessaoOk = await verificarSessaoPainel();
    if (!sessaoOk) return;

    const dados = await chamarApi("/api/admin/conteudos");

    if (!dados.ok) {
        atualizarResumoPainel();
        lista.innerHTML = `
            <div class="estado-vazio estado-vazio-admin">
                <h3>Não foi possível carregar os conteúdos.</h3>
                <p>${escaparHtml(dados.mensagem)}</p>
            </div>
        `;
        return;
    }

    atualizarResumoPainel(dados.conteudos);

    if (!dados.conteudos.length) {
        lista.innerHTML = `
            <div class="estado-vazio estado-vazio-admin">
                <h3>Nenhum conteúdo cadastrado.</h3>
                <p>Use o formulário ao lado para publicar o primeiro material.</p>
            </div>
        `;
        return;
    }

    lista.innerHTML = dados.conteudos.map((conteudo) => `
        <article class="item-admin ${conteudo.publicado ? "item-admin-publicado" : "item-admin-rascunho"}">
            <div class="item-admin-conteudo">
                <div class="linha-meta linha-meta-admin">
                    <span>${escaparHtml(nomeNivel(conteudo.nivel))}</span>
                    <span>${escaparHtml(nomeTipo(conteudo.tipo))}</span>
                    <span class="status-conteudo ${conteudo.publicado ? "status-publicado" : "status-rascunho"}">${conteudo.publicado ? "Publicado" : "Rascunho"}</span>
                </div>
                <h3>${escaparHtml(conteudo.titulo)}</h3>
                <p>${escaparHtml(conteudo.descricao)}</p>
                <div class="item-admin-info">
                    <span><i class="icon-calendar-days" aria-hidden="true"></i> ${escaparHtml(conteudo.atualizado_em || conteudo.criado_em || "Sem data")}</span>
                    ${conteudo.url_recurso ? `<a href="${escaparHtml(conteudo.url_recurso)}" target="_blank" rel="noopener"><i class="icon-external-link" aria-hidden="true"></i> Recurso</a>` : ""}
                </div>
            </div>
            <div class="acoes-admin">
                <button class="botao botao-pequeno botao-secundario" type="button" data-acao="publicacao" data-id="${conteudo.id_conteudo}">
                    <i class="${conteudo.publicado ? "icon-eye-off" : "icon-eye"}" aria-hidden="true"></i>
                    ${conteudo.publicado ? "Ocultar" : "Publicar"}
                </button>
                <button class="botao botao-pequeno botao-perigo" type="button" data-acao="excluir" data-id="${conteudo.id_conteudo}">
                    <i class="icon-trash-2" aria-hidden="true"></i> Excluir
                </button>
            </div>
        </article>
    `).join("");
}

function configurarFormularioConteudo() {
    const formulario = document.querySelector("#form-conteudo");
    if (!formulario) return;

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const dadosFormulario = new FormData(formulario);
        const dados = Object.fromEntries(dadosFormulario.entries());
        dados.publicado = formulario.querySelector('[name="publicado"]').checked;

        const resposta = await chamarApi("/api/admin/conteudos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
        });

        if (!resposta.ok) {
            mostrarMensagem("mensagem-painel", resposta.mensagem || "Não foi possível salvar.", "erro");
            return;
        }

        formulario.reset();
        formulario.querySelector('[name="publicado"]').checked = true;
        mostrarMensagem("mensagem-painel", resposta.mensagem, "sucesso");
        await carregarPainel();
    });
}

function configurarAcoesPainel() {
    const lista = document.querySelector("#lista-admin");
    if (!lista) return;

    lista.addEventListener("click", async (evento) => {
        const botao = evento.target.closest("button[data-acao]");
        if (!botao) return;

        const idConteudo = botao.dataset.id;
        const acao = botao.dataset.acao;

        if (acao === "excluir" && !confirm("Excluir este conteúdo?")) {
            return;
        }

        const url = acao === "publicacao"
            ? `/api/admin/conteudos/${idConteudo}/publicacao`
            : `/api/admin/conteudos/${idConteudo}`;

        const resposta = await chamarApi(url, {
            method: acao === "publicacao" ? "POST" : "DELETE",
        });

        if (!resposta.ok) {
            mostrarMensagem("mensagem-painel", resposta.mensagem || "Ação não concluída.", "erro");
            return;
        }

        mostrarMensagem("mensagem-painel", resposta.mensagem, "sucesso");
        await carregarPainel();
    });
}

carregarConteudosPublicos();
configurarLogin();
configurarFormularioConteudo();
configurarAcoesPainel();
carregarPainel();

const botao_menu = document.querySelector(".botao-menu");
const menu_principal = document.querySelector("#menu-principal");

if (botao_menu && menu_principal) {
    botao_menu.addEventListener("click", () => {
        const menu_aberto = botao_menu.getAttribute("aria-expanded") === "true";
        botao_menu.setAttribute("aria-expanded", String(!menu_aberto));
        menu_principal.classList.toggle("menu-aberto");
    });
}

const ano_atual = document.querySelector("#ano-atual");
if (ano_atual) {
    ano_atual.textContent = new Date().getFullYear();
}

function escapar_html(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function nome_nivel(nivel) {
    const niveis = {
        iniciante: "Iniciante",
        intermediario: "Intermediário",
        avancado: "Avançado",
    };
    return niveis[nivel] || nivel;
}

function nome_tipo(tipo) {
    const tipos = {
        video: "Vídeo",
        material: "Material",
        tarefa: "Tarefa",
        texto: "Texto",
    };
    return tipos[tipo] || tipo;
}

function icone_tipo(tipo) {
    const icones = {
        video: "icon-circle-play",
        material: "icon-file-text",
        tarefa: "icon-list-checks",
        texto: "icon-book-open-text",
    };
    return icones[tipo] || "icon-file";
}

async function chamar_api(endereco, opcoes = {}) {
    let resposta;

    try {
        resposta = await fetch(endereco, {
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

function mostrar_mensagem(id_elemento, mensagem, tipo = "erro") {
    const elemento = document.querySelector(`#${id_elemento}`);
    if (!elemento) return;

    elemento.innerHTML = `
        <div class="aviso aviso-${tipo}">
            <span>${escapar_html(mensagem)}</span>
        </div>
    `;
}

function conteudo_vazio(titulo, texto = "") {
    return `
        <div class="estado-vazio">
            <i class="icon-inbox" aria-hidden="true"></i>
            <h2>${escapar_html(titulo)}</h2>
            ${texto ? `<p>${escapar_html(texto)}</p>` : ""}
        </div>
    `;
}

function atualizar_contador_conteudos(total) {
    const contador = document.querySelector("#conteudos-total");
    if (contador) contador.textContent = total;
}

async function carregar_conteudos_publicos() {
    const lista = document.querySelector("#lista-conteudos");
    if (!lista) return;

    const parametros = new URLSearchParams(window.location.search);
    const nivel = parametros.get("nivel") || "todos";

    document.querySelectorAll(".filtros a").forEach((filtro) => {
        filtro.classList.toggle("ativo", filtro.dataset.nivel === nivel);
    });

    const dados = await chamar_api(`/api/conteudos?nivel=${encodeURIComponent(nivel)}`);

    if (!dados.ok) {
        atualizar_contador_conteudos(0);
        lista.innerHTML = conteudo_vazio("Não foi possível carregar os conteúdos.", dados.mensagem);
        return;
    }

    atualizar_contador_conteudos(dados.conteudos.length);

    if (!dados.conteudos.length) {
        lista.innerHTML = conteudo_vazio(
            "Nenhum conteúdo publicado ainda.",
            "Assim que a professora cadastrar materiais no painel, eles aparecerão aqui."
        );
        return;
    }

    lista.innerHTML = dados.conteudos.map((conteudo) => `
        <article class="cartao-conteudo cartao-conteudo-${escapar_html(conteudo.nivel)}">
            <div class="cartao-conteudo-icone">
                <i class="${escapar_html(icone_tipo(conteudo.tipo))}" aria-hidden="true"></i>
            </div>
            <div class="linha-meta linha-meta-conteudo">
                <span>${escapar_html(nome_nivel(conteudo.nivel))}</span>
                <span>${escapar_html(nome_tipo(conteudo.tipo))}</span>
            </div>
            <h2>${escapar_html(conteudo.titulo)}</h2>
            <p>${escapar_html(conteudo.descricao)}</p>
            ${conteudo.texto_conteudo ? `<div class="texto-conteudo">${escapar_html(conteudo.texto_conteudo)}</div>` : ""}
            <div class="rodape-conteudo">
                <small><i class="icon-user-round" aria-hidden="true"></i> ${escapar_html(conteudo.nome_professor)}</small>
                ${conteudo.url_recurso ? `<a class="botao botao-pequeno" href="${escapar_html(conteudo.url_recurso)}" target="_blank" rel="noopener"><i class="icon-external-link" aria-hidden="true"></i> Abrir recurso</a>` : `<span class="conteudo-sem-link"><i class="icon-book-open" aria-hidden="true"></i> Texto na plataforma</span>`}
            </div>
        </article>
    `).join("");
}

function configurar_login() {
    const formulario = document.querySelector("#form-login");
    if (!formulario) return;

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const dados_formulario = new FormData(formulario);
        const dados = {
            email: dados_formulario.get("email"),
            senha: dados_formulario.get("senha"),
        };

        const resposta = await chamar_api("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
        });

        if (resposta.ok) {
            window.location.href = "/painel";
            return;
        }

        mostrar_mensagem("mensagem-login", resposta.mensagem || "Login inválido.", "erro");
    });
}

async function verificar_sessao_painel() {
    const painel = document.querySelector("#form-conteudo");
    if (!painel) return false;

    const sessao = await chamar_api("/api/sessao");
    if (!sessao.logado) {
        window.location.href = "/login";
        return false;
    }

    const nome_professor = document.querySelector("#painel-professor");
    if (nome_professor && sessao.professor?.nome) {
        nome_professor.textContent = sessao.professor.nome;
    }

    return true;
}

function atualizar_resumo_painel(conteudos = []) {
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

async function carregar_painel() {
    const lista = document.querySelector("#lista-admin");
    if (!lista) return;

    const sessao_ok = await verificar_sessao_painel();
    if (!sessao_ok) return;

    const dados = await chamar_api("/api/admin/conteudos");

    if (!dados.ok) {
        atualizar_resumo_painel();
        lista.innerHTML = `
            <div class="estado-vazio estado-vazio-admin">
                <h3>Não foi possível carregar os conteúdos.</h3>
                <p>${escapar_html(dados.mensagem)}</p>
            </div>
        `;
        return;
    }

    atualizar_resumo_painel(dados.conteudos);

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
                    <span>${escapar_html(nome_nivel(conteudo.nivel))}</span>
                    <span>${escapar_html(nome_tipo(conteudo.tipo))}</span>
                    <span class="status-conteudo ${conteudo.publicado ? "status-publicado" : "status-rascunho"}">${conteudo.publicado ? "Publicado" : "Rascunho"}</span>
                </div>
                <h3>${escapar_html(conteudo.titulo)}</h3>
                <p>${escapar_html(conteudo.descricao)}</p>
                <div class="item-admin-info">
                    <span><i class="icon-calendar-days" aria-hidden="true"></i> ${escapar_html(conteudo.atualizado_em || conteudo.criado_em || "Sem data")}</span>
                    ${conteudo.url_recurso ? `<a href="${escapar_html(conteudo.url_recurso)}" target="_blank" rel="noopener"><i class="icon-external-link" aria-hidden="true"></i> Recurso</a>` : ""}
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

function configurar_formulario_conteudo() {
    const formulario = document.querySelector("#form-conteudo");
    if (!formulario) return;

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const dados_formulario = new FormData(formulario);
        const dados = Object.fromEntries(dados_formulario.entries());
        dados.publicado = formulario.querySelector('[name="publicado"]').checked;

        const resposta = await chamar_api("/api/admin/conteudos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
        });

        if (!resposta.ok) {
            mostrar_mensagem("mensagem-painel", resposta.mensagem || "Não foi possível salvar.", "erro");
            return;
        }

        formulario.reset();
        formulario.querySelector('[name="publicado"]').checked = true;
        mostrar_mensagem("mensagem-painel", resposta.mensagem, "sucesso");
        await carregar_painel();
    });
}

function configurar_acoes_painel() {
    const lista = document.querySelector("#lista-admin");
    if (!lista) return;

    lista.addEventListener("click", async (evento) => {
        const botao = evento.target.closest("button[data-acao]");
        if (!botao) return;

        const id_conteudo = botao.dataset.id;
        const acao = botao.dataset.acao;

        if (acao === "excluir" && !confirm("Excluir este conteúdo?")) {
            return;
        }

        const endereco = acao === "publicacao"
            ? `/api/admin/conteudos/${id_conteudo}/publicacao`
            : `/api/admin/conteudos/${id_conteudo}`;

        const resposta = await chamar_api(endereco, {
            method: acao === "publicacao" ? "POST" : "DELETE",
        });

        if (!resposta.ok) {
            mostrar_mensagem("mensagem-painel", resposta.mensagem || "Ação não concluída.", "erro");
            return;
        }

        mostrar_mensagem("mensagem-painel", resposta.mensagem, "sucesso");
        await carregar_painel();
    });
}

carregar_conteudos_publicos();
configurar_login();
configurar_formulario_conteudo();
configurar_acoes_painel();
carregar_painel();

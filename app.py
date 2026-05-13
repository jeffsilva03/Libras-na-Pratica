from functools import wraps
from pathlib import Path

from flask import Flask, jsonify, redirect, request, send_from_directory, session
from werkzeug.security import check_password_hash

from banco import (
    alternar_publicacao,
    buscar_professor_por_email,
    excluir_conteudo,
    iniciar_banco,
    listar_conteudos_publicos,
    listar_todos_conteudos,
    salvar_conteudo,
)
from configuracao import obter_configuracao


PASTA_BASE = Path(__file__).resolve().parent
PASTA_FRONTEND = PASTA_BASE / "frontend"

aplicacao = Flask(__name__, static_folder="static")
configuracao = obter_configuracao()
aplicacao.secret_key = configuracao["chave_secreta"]
erro_banco = None


def preparar_banco():
    global erro_banco
    try:
        iniciar_banco()
        erro_banco = None
    except Exception as erro:
        erro_banco = str(erro)


preparar_banco()


def banco_disponivel():
    if erro_banco:
        preparar_banco()
    return erro_banco is None


def enviar_pagina(nome_arquivo):
    return send_from_directory(PASTA_FRONTEND, nome_arquivo)


def resposta_erro(mensagem, codigo=400):
    return jsonify({"ok": False, "mensagem": mensagem}), codigo


def dados_requisicao():
    if request.is_json:
        return request.get_json(silent=True) or {}
    return request.form


def valor_texto(dados, nome_campo):
    return str(dados.get(nome_campo, "")).strip()


def valor_publicado(dados):
    valor = dados.get("publicado", False)
    return 1 if valor in [True, "true", "True", "1", "on", 1] else 0


def conteudo_para_json(conteudo):
    dados = dict(conteudo)

    for campo_data in ["criado_em", "atualizado_em"]:
        valor = dados.get(campo_data)
        if hasattr(valor, "strftime"):
            dados[campo_data] = valor.strftime("%d/%m/%Y %H:%M")

    dados["publicado"] = bool(dados.get("publicado"))
    return dados


def professor_logado_api(funcao):
    @wraps(funcao)
    def rota_protegida(*argumentos, **nomeados):
        if not session.get("professor_id"):
            return resposta_erro("Faça login para acessar o painel.", 401)
        return funcao(*argumentos, **nomeados)

    return rota_protegida


@aplicacao.get("/")
@aplicacao.get("/index.html")
def pagina_inicial():
    return enviar_pagina("index.html")


@aplicacao.get("/conteudos")
@aplicacao.get("/conteudos.html")
def pagina_conteudos():
    return enviar_pagina("conteudos.html")


@aplicacao.get("/login")
@aplicacao.get("/login.html")
def pagina_login():
    return enviar_pagina("login.html")


@aplicacao.get("/painel")
@aplicacao.get("/painel.html")
def pagina_painel():
    if not session.get("professor_id"):
        return redirect("/login")
    return enviar_pagina("painel.html")


@aplicacao.get("/sair")
def sair():
    session.clear()
    return redirect("/")


@aplicacao.get("/api/status")
def api_status():
    return jsonify({"ok": banco_disponivel(), "erro_banco": erro_banco})


@aplicacao.get("/api/sessao")
def api_sessao():
    logado = bool(session.get("professor_id"))
    return jsonify(
        {
            "ok": True,
            "logado": logado,
            "professor": {
                "id_professor": session.get("professor_id"),
                "nome": session.get("professor_nome"),
            }
            if logado
            else None,
        }
    )


@aplicacao.post("/api/login")
def api_login():
    dados = dados_requisicao()
    email = valor_texto(dados, "email")
    senha = valor_texto(dados, "senha")

    if not email or not senha:
        return resposta_erro("Preencha e-mail e senha.")

    if not banco_disponivel():
        return resposta_erro("Não foi possível conectar ao banco de dados.", 503)

    professor = buscar_professor_por_email(email)

    if professor and check_password_hash(professor["senha_hash"], senha):
        session["professor_id"] = professor["id_professor"]
        session["professor_nome"] = professor["nome"]
        return jsonify({"ok": True, "mensagem": "Login realizado com sucesso."})

    return resposta_erro("E-mail ou senha inválidos.", 401)


@aplicacao.get("/api/conteudos")
def api_conteudos_publicos():
    nivel = request.args.get("nivel", "todos")

    if not banco_disponivel():
        return resposta_erro("O banco de dados ainda não está disponível.", 503)

    conteudos = listar_conteudos_publicos(nivel)
    return jsonify(
        {
            "ok": True,
            "conteudos": [conteudo_para_json(conteudo) for conteudo in conteudos],
        }
    )


@aplicacao.get("/api/admin/conteudos")
@professor_logado_api
def api_admin_conteudos():
    if not banco_disponivel():
        return resposta_erro("O banco de dados ainda não está disponível.", 503)

    conteudos = listar_todos_conteudos()
    return jsonify(
        {
            "ok": True,
            "conteudos": [conteudo_para_json(conteudo) for conteudo in conteudos],
        }
    )


@aplicacao.post("/api/admin/conteudos")
@professor_logado_api
def api_criar_conteudo():
    if not banco_disponivel():
        return resposta_erro("Não foi possível conectar ao banco de dados.", 503)

    dados = dados_requisicao()
    dados_conteudo = {
        "titulo": valor_texto(dados, "titulo"),
        "descricao": valor_texto(dados, "descricao"),
        "nivel": valor_texto(dados, "nivel"),
        "tipo": valor_texto(dados, "tipo"),
        "url_recurso": valor_texto(dados, "url_recurso"),
        "texto_conteudo": valor_texto(dados, "texto_conteudo"),
        "publicado": valor_publicado(dados),
    }

    campos_obrigatorios = ["titulo", "descricao", "nivel", "tipo"]
    campos_vazios = [campo for campo in campos_obrigatorios if not dados_conteudo[campo]]

    if campos_vazios:
        return resposta_erro("Preencha título, descrição, nível e tipo.")

    salvar_conteudo(dados_conteudo, session["professor_id"])
    return jsonify({"ok": True, "mensagem": "Conteúdo cadastrado com sucesso."})


@aplicacao.post("/api/admin/conteudos/<int:id_conteudo>/publicacao")
@professor_logado_api
def api_mudar_publicacao(id_conteudo):
    if not banco_disponivel():
        return resposta_erro("Não foi possível conectar ao banco de dados.", 503)

    alternar_publicacao(id_conteudo)
    return jsonify({"ok": True, "mensagem": "Status do conteúdo atualizado."})


@aplicacao.delete("/api/admin/conteudos/<int:id_conteudo>")
@professor_logado_api
def api_excluir_conteudo(id_conteudo):
    if not banco_disponivel():
        return resposta_erro("Não foi possível conectar ao banco de dados.", 503)

    excluir_conteudo(id_conteudo)
    return jsonify({"ok": True, "mensagem": "Conteúdo excluído."})


if __name__ == "__main__":
    aplicacao.run(debug=True)

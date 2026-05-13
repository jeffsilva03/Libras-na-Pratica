import re

import mysql.connector
from werkzeug.security import generate_password_hash

from configuracao import obter_configuracao


NIVEIS_VALIDOS = {"iniciante", "intermediario", "avancado"}
TIPOS_VALIDOS = {"video", "material", "tarefa", "texto"}


def nome_banco_seguro(nome_banco):
    if not re.fullmatch(r"[A-Za-z0-9_]+", nome_banco):
        raise ValueError("O nome do banco deve usar apenas letras, números e underline.")
    return nome_banco


def obter_conexao(usar_banco=True):
    configuracao = obter_configuracao()
    ssl_mode = configuracao["banco_ssl_mode"].strip().upper()
    dados_conexao = {
        "host": configuracao["banco_host"],
        "port": configuracao["banco_porta"],
        "user": configuracao["banco_usuario"],
        "password": configuracao["banco_senha"],
        "charset": "utf8mb4",
        "use_unicode": True,
    }

    if ssl_mode in {"REQUIRED", "VERIFY_CA", "VERIFY_IDENTITY"}:
        dados_conexao["ssl_disabled"] = False

        if configuracao["banco_ssl_ca"]:
            dados_conexao["ssl_ca"] = configuracao["banco_ssl_ca"]
            dados_conexao["ssl_verify_cert"] = ssl_mode in {"VERIFY_CA", "VERIFY_IDENTITY"}
            dados_conexao["ssl_verify_identity"] = ssl_mode == "VERIFY_IDENTITY"
    elif ssl_mode == "DISABLED":
        dados_conexao["ssl_disabled"] = True

    if usar_banco:
        dados_conexao["database"] = configuracao["banco_nome"]

    return mysql.connector.connect(**dados_conexao)


def iniciar_banco():
    configuracao = obter_configuracao()
    nome_banco = nome_banco_seguro(configuracao["banco_nome"])

    if configuracao["banco_criar_banco"]:
        conexao_inicial = obter_conexao(usar_banco=False)
        cursor_inicial = conexao_inicial.cursor()
        cursor_inicial.execute(
            f"CREATE DATABASE IF NOT EXISTS `{nome_banco}` "
            "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        )
        cursor_inicial.close()
        conexao_inicial.close()

    conexao = obter_conexao()
    cursor = conexao.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS professores (
            id_professor INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(120) NOT NULL,
            email VARCHAR(160) NOT NULL UNIQUE,
            senha_hash VARCHAR(255) NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS conteudos (
            id_conteudo INT AUTO_INCREMENT PRIMARY KEY,
            titulo VARCHAR(160) NOT NULL,
            descricao TEXT NOT NULL,
            nivel ENUM('iniciante', 'intermediario', 'avancado') NOT NULL,
            tipo ENUM('video', 'material', 'tarefa', 'texto') NOT NULL,
            url_recurso VARCHAR(500),
            texto_conteudo TEXT,
            publicado TINYINT(1) NOT NULL DEFAULT 1,
            id_professor INT NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_conteudos_professores
                FOREIGN KEY (id_professor) REFERENCES professores(id_professor)
                ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
    )

    cursor.execute("SELECT COUNT(*) FROM professores")
    total_professores = cursor.fetchone()[0]

    if total_professores == 0:
        senha_hash = generate_password_hash("professor123")
        cursor.execute(
            """
            INSERT INTO professores (nome, email, senha_hash)
            VALUES (%s, %s, %s)
            """,
            ("Professora Élida Oliveira", "professor@librasnapratica.org", senha_hash),
        )

    conexao.commit()
    cursor.close()
    conexao.close()


def buscar_professor_por_email(email):
    conexao = obter_conexao()
    cursor = conexao.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT id_professor, nome, email, senha_hash
        FROM professores
        WHERE email = %s
        LIMIT 1
        """,
        (email,),
    )
    professor = cursor.fetchone()
    cursor.close()
    conexao.close()
    return professor


def listar_conteudos_publicos(nivel_escolhido="todos"):
    conexao = obter_conexao()
    cursor = conexao.cursor(dictionary=True)
    parametros = []
    consulta = """
        SELECT c.*, p.nome AS nome_professor
        FROM conteudos c
        INNER JOIN professores p ON p.id_professor = c.id_professor
        WHERE c.publicado = 1
    """

    if nivel_escolhido in NIVEIS_VALIDOS:
        consulta += " AND c.nivel = %s"
        parametros.append(nivel_escolhido)

    consulta += " ORDER BY c.criado_em DESC"
    cursor.execute(consulta, tuple(parametros))
    conteudos = cursor.fetchall()
    cursor.close()
    conexao.close()
    return conteudos


def listar_todos_conteudos():
    conexao = obter_conexao()
    cursor = conexao.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT c.*, p.nome AS nome_professor
        FROM conteudos c
        INNER JOIN professores p ON p.id_professor = c.id_professor
        ORDER BY c.criado_em DESC
        """
    )
    conteudos = cursor.fetchall()
    cursor.close()
    conexao.close()
    return conteudos


def validar_conteudo(dados_conteudo):
    if dados_conteudo["nivel"] not in NIVEIS_VALIDOS:
        raise ValueError("Nível inválido.")

    if dados_conteudo["tipo"] not in TIPOS_VALIDOS:
        raise ValueError("Tipo de conteúdo inválido.")


def salvar_conteudo(dados_conteudo, id_professor):
    validar_conteudo(dados_conteudo)
    conexao = obter_conexao()
    cursor = conexao.cursor()
    cursor.execute(
        """
        INSERT INTO conteudos
            (titulo, descricao, nivel, tipo, url_recurso, texto_conteudo, publicado, id_professor)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            dados_conteudo["titulo"],
            dados_conteudo["descricao"],
            dados_conteudo["nivel"],
            dados_conteudo["tipo"],
            dados_conteudo["url_recurso"] or None,
            dados_conteudo["texto_conteudo"] or None,
            dados_conteudo["publicado"],
            id_professor,
        ),
    )
    conexao.commit()
    cursor.close()
    conexao.close()


def alternar_publicacao(id_conteudo):
    conexao = obter_conexao()
    cursor = conexao.cursor()
    cursor.execute(
        """
        UPDATE conteudos
        SET publicado = CASE WHEN publicado = 1 THEN 0 ELSE 1 END
        WHERE id_conteudo = %s
        """,
        (id_conteudo,),
    )
    conexao.commit()
    cursor.close()
    conexao.close()


def excluir_conteudo(id_conteudo):
    conexao = obter_conexao()
    cursor = conexao.cursor()
    cursor.execute("DELETE FROM conteudos WHERE id_conteudo = %s", (id_conteudo,))
    conexao.commit()
    cursor.close()
    conexao.close()

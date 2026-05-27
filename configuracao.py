import os

try:
    from dotenv import load_dotenv as carregar_variaveis_ambiente
except ImportError:
    carregar_variaveis_ambiente = None


if carregar_variaveis_ambiente:
    carregar_variaveis_ambiente()


def obter_booleano(nome_variavel, padrao=False):
    valor = os.environ.get(nome_variavel)

    if valor is None:
        return padrao

    return valor.strip().lower() in {"1", "true", "sim", "yes", "on"}


def obter_configuracao():
    endereco_banco = os.environ.get("BANCO_HOST", "localhost")
    banco_eh_local = endereco_banco in {"localhost", "127.0.0.1", "::1"}

    return {
        "banco_host": endereco_banco,
        "banco_porta": int(os.environ.get("BANCO_PORTA", "3306")),
        "banco_usuario": os.environ.get("BANCO_USUARIO", "root"),
        "banco_senha": os.environ.get("BANCO_SENHA", ""),
        "banco_nome": os.environ.get("BANCO_NOME", "libras_na_pratica"),
        "banco_ssl_mode": os.environ.get("BANCO_SSL_MODE", "DISABLED"),
        "banco_ssl_ca": os.environ.get("BANCO_SSL_CA", ""),
        "banco_criar_banco": obter_booleano("BANCO_CRIAR_BANCO", banco_eh_local),
        "chave_secreta": os.environ.get(
            "CHAVE_SECRETA",
            "troque-esta-chave-em-producao",
        ),
    }

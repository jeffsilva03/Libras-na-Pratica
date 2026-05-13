# Libras na Prática - Web

Plataforma web simples para divulgação do projeto Libras na Prática e postagem de conteúdos por professores.

## Arquitetura

O projeto foi separado de forma simples:

```text
frontend/          HTML puro das páginas
static/css/        estilos CSS
static/js/         JavaScript do navegador
static/img/        imagens e ilustrações
app.py             backend em Python com Flask
banco.py           funções do MySQL
dados/             script SQL do banco
```

O Python não monta HTML com templates. Ele apenas:

- entrega as páginas estáticas de `frontend/`;
- cuida do login e da sessão do professor;
- fornece APIs em `/api/...`;
- salva e lista conteúdos usando MySQL.

## Tecnologias

- HTML, CSS e JavaScript no front-end
- Python com Flask no back-end
- MySQL como banco de dados
- Widget VLibras para acessibilidade

## Como rodar

### Abrir só o front-end

Para ver a página inicial como um projeto simples de HTML, CSS e JS, abra este arquivo direto no navegador:

```text
frontend/index.html
```

Essa parte não precisa de Python nem MySQL.

### Rodar o backend do professor

Use o backend apenas quando precisar de login do professor, cadastro de conteúdos e banco de dados.

1. Instale as dependências:

```powershell
python -m pip install -r requirements.txt
```

2. Configure o MySQL. Se seu usuário for `root` sem senha, não precisa mudar nada. Caso use senha, rode:

```powershell
$env:BANCO_HOST="localhost"
$env:BANCO_PORTA="3306"
$env:BANCO_USUARIO="root"
$env:BANCO_SENHA="sua_senha"
$env:BANCO_NOME="libras_na_pratica"
```

3. Inicie o servidor:

```powershell
python app.py
```

4. Acesse:

```text
http://127.0.0.1:5000
```

## Login inicial do professor

O sistema cria automaticamente um professor padrão na primeira conexão com o MySQL:

```text
E-mail: professor@librasnapratica.org
Senha: professor123
```

Troque esses dados antes de usar em um ambiente real.

## Banco de dados

O arquivo `dados/criar_banco.sql` contém a estrutura das tabelas. O próprio Python também cria o banco e as tabelas automaticamente ao iniciar.

# Libras na Prática — Plataforma Web de Apoio ao Ensino de LIBRAS

<div align="center">

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Status](https://img.shields.io/badge/Status-Conclu%C3%ADdo-brightgreen?style=for-the-badge)

**Plataforma web desenvolvida para apoiar o curso Libras na Prática, reunindo apresentação institucional, biblioteca pública de conteúdos e painel administrativo para professores publicarem materiais, tarefas, vídeos e textos de apoio.**

</div>

---

## Sobre o projeto

Este projeto foi desenvolvido como uma aplicação web educacional voltada ao ensino e à divulgação da Língua Brasileira de Sinais (LIBRAS).

A plataforma apresenta o curso Libras na Prática, destaca sua proposta de inclusão e oferece uma área de estudos onde alunos podem acessar conteúdos organizados por nível de aprendizagem.

Além da parte pública, o sistema possui uma área restrita para professores. Por meio do painel administrativo, o professor pode cadastrar novos conteúdos, definir o nível, escolher o tipo de material, publicar ou ocultar itens e remover conteúdos quando necessário.

O backend foi construído com Flask e utiliza banco de dados MySQL para armazenar professores e conteúdos cadastrados.

## Objetivos da entrega

* Criar uma **plataforma educacional para apoio ao ensino de LIBRAS**
* Apresentar o projeto, a professora responsável e a proposta do curso
* Disponibilizar uma **biblioteca pública de conteúdos**
* Organizar materiais por **níveis de aprendizagem**
* Implementar **login de professor**
* Criar um **painel administrativo** para cadastro e gerenciamento de conteúdos
* Integrar frontend, backend e banco de dados
* Preparar a aplicação para deploy em ambiente web

## Módulos do sistema

| Módulo              | Funcionalidade                                             |
| ------------------- | ---------------------------------------------------------- |
| Página inicial      | Apresentação do curso, impacto, níveis, professora e fotos |
| Conteúdos           | Biblioteca pública com filtros por nível                   |
| Login do professor  | Autenticação para acesso ao painel administrativo          |
| Painel do professor | Cadastro, listagem, publicação e exclusão de conteúdos     |
| API pública         | Consulta de conteúdos publicados                           |
| API administrativa  | Gerenciamento de conteúdos com sessão autenticada          |
| Banco de dados      | Persistência de professores e materiais do curso           |
| Deploy              | Configuração para execução em serviços como Render         |

## Conceitos aplicados

```text
1. Rotas com Flask          — criação de páginas e endpoints da aplicação
2. API REST                 — comunicação entre frontend e backend
3. Sessões                  — controle de login do professor
4. MySQL                    — persistência de professores e conteúdos
5. CRUD parcial             — criação, leitura, publicação e exclusão de conteúdos
6. Fetch API                — requisições assíncronas no frontend
7. DOM dinâmico             — renderização de cards, mensagens e listas
8. Responsividade           — adaptação da interface para diferentes telas
9. Acessibilidade           — integração com VLibras e estrutura semântica
10. Deploy web              — configuração com Gunicorn e render.yaml
```

## Tecnologias

* **Python** — linguagem utilizada no backend
* **Flask** — framework web da aplicação
* **MySQL** — banco de dados relacional
* **mysql-connector-python** — conexão entre Python e MySQL
* **Gunicorn** — servidor WSGI para produção
* **python-dotenv** — carregamento de variáveis de ambiente
* **HTML5** — estrutura das páginas
* **CSS3** — estilização e responsividade
* **JavaScript** — interatividade, requisições e manipulação da interface
* **VLibras** — recurso de acessibilidade para tradução em LIBRAS
* **Render** — ambiente previsto para deploy

## Estrutura do projeto

```text
Libras-na-Pr-tica/
├── app.py
├── banco.py
├── configuracao.py
├── render.yaml
├── requirements.txt
├── dados/
│   └── banco.sql
├── frontend/
│   ├── conteudos.html
│   ├── index.html
│   ├── login.html
│   └── painel.html
└── static/
    ├── css/
    │   └── style.css
    ├── img/
    │   ├── foto-sinais-libras.svg
    │   ├── foto2.jpg
    │   ├── foto3.jpg
    │   ├── foto4.jpg
    │   ├── foto5.jpg
    │   ├── foto8.jpg
    │   ├── logo.png
    │   └── professora.png
    └── js/
        └── principal.js
```

## Como usar

### Pré-requisitos

* Python 3.10 ou superior
* MySQL instalado ou banco MySQL remoto
* Navegador web moderno (Chrome, Edge, Firefox)

### Execução local

```bash
# Clone o repositório
git clone https://github.com/jeffsilva03/Libras-na-Pratica.git

# Acesse a pasta
cd Libras-na-Pratica

# Crie um ambiente virtual
python -m venv .venv

# Ative o ambiente virtual no Windows
.venv\Scripts\activate

# Instale as dependências
pip install -r requirements.txt

# Execute a aplicação
python app.py
```

Depois de iniciar o servidor, acesse:

```text
http://localhost:5000
```

### Variáveis de ambiente

A aplicação pode ser configurada por variáveis de ambiente. Em ambiente local, é possível criar um arquivo `.env` na raiz do projeto:

```env
BANCO_HOST=localhost
BANCO_PORTA=3306
BANCO_USUARIO=root
BANCO_SENHA=
BANCO_NOME=libras_na_pratica
BANCO_SSL_MODE=DISABLED
BANCO_CRIAR_BANCO=true
CHAVE_SECRETA=troque-esta-chave-em-producao
```

| Variável            | Descrição                                      |
| ------------------- | ---------------------------------------------- |
| BANCO_HOST          | Endereço do servidor MySQL                     |
| BANCO_PORTA         | Porta de conexão do MySQL                      |
| BANCO_USUARIO       | Usuário do banco de dados                      |
| BANCO_SENHA         | Senha do banco de dados                        |
| BANCO_NOME          | Nome do banco utilizado pela aplicação         |
| BANCO_SSL_MODE      | Modo SSL da conexão com o banco                |
| BANCO_CRIAR_BANCO   | Define se a aplicação deve criar o banco local |
| CHAVE_SECRETA       | Chave usada para sessão do Flask               |

## Acesso ao painel

Quando o banco é iniciado pela primeira vez, o sistema cria um professor padrão para testes

## Exemplos de uso

**Aluno acessando conteúdos:**

```text
Usuário acessa a página Conteúdos
Escolhe um filtro: todos, iniciante, intermediário ou avançado
O sistema lista apenas os materiais publicados
```

**Professor cadastrando material:**

```text
Professor faz login no painel
Preenche título, descrição, nível, tipo e recurso
Define se o conteúdo será publicado
O material fica disponível na biblioteca pública
```

**Gerenciamento no painel:**

```text
Professor visualiza todos os conteúdos cadastrados
Pode alternar entre publicado e rascunho
Pode excluir conteúdos antigos ou incorretos
```

## Limitações conhecidas

| Limitação                    | Comportamento                                      |
| ---------------------------- | -------------------------------------------------- |
| Cadastro único de professor  | O sistema cria apenas um usuário inicial           |
| Sem edição de conteúdo       | Conteúdos podem ser criados, publicados e excluídos |
| Sem upload de arquivos       | Materiais externos são informados por URL          |
| Dependência de MySQL         | A aplicação precisa de banco configurado           |
| Credenciais iniciais fixas   | Devem ser alteradas em ambiente de produção        |

> Essas limitações fazem parte do escopo atual do projeto. Como evolução, podem ser adicionados cadastro de professores, edição de conteúdos, upload de arquivos, redefinição de senha e acompanhamento de progresso dos alunos.

---

<div align="center">

Desenvolvido como plataforma educacional para apoiar o ensino de LIBRAS, ampliar o acesso aos conteúdos do curso e fortalecer práticas de inclusão.

</div>

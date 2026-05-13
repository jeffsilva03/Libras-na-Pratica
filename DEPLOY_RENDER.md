# Deploy gratuito no Render + Aiven

Este projeto esta pronto para rodar no Render usando o MySQL da Aiven.

## 1. Subir o projeto para o GitHub

Envie estes arquivos para um repositorio no GitHub.

Nao envie arquivo `.env` com senha. O `.gitignore` ja esta preparado para ignorar esse arquivo.

## 2. Criar o Web Service no Render

No Render, crie um novo **Web Service** conectado ao repositorio.

Se o Render detectar o arquivo `render.yaml`, ele ja vai usar:

```text
Build Command: pip install -r requirements.txt
Start Command: gunicorn --bind 0.0.0.0:$PORT app:aplicacao
```

## 3. Variaveis de ambiente

No Render, em **Environment**, preencha:

```text
BANCO_HOST=host_da_aiven
BANCO_PORTA=porta_da_aiven
BANCO_USUARIO=avnadmin
BANCO_SENHA=senha_da_aiven
BANCO_NOME=defaultdb
BANCO_SSL_MODE=REQUIRED
BANCO_CRIAR_BANCO=false
CHAVE_SECRETA=uma_chave_grande_e_aleatoria
```

Use os valores da tela **Connection information** da Aiven.

## 4. Depois do deploy

Acesse a URL gerada pelo Render.

Login inicial:

```text
E-mail: professor@librasnapratica.org
Senha: professor123
```

Troque esses dados antes de usar o site em publico.

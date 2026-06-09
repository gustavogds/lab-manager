# Guia de Deploy para Produção - Lab Manager

Este guia cobre **todos os passos** para colocar o Lab Manager em produção em um servidor Linux usando uWSGI + Nginx. Siga as etapas em ordem, cada uma depende das anteriores.

---

## Índice

1. [Pré-requisitos do Servidor](#1-pré-requisitos-do-servidor)
2. [Instalação de Dependências do Sistema](#2-instalação-de-dependências-do-sistema)
3. [Configuração do PostgreSQL](#3-configuração-do-postgresql)
4. [Clonar o Projeto no Servidor](#4-clonar-o-projeto-no-servidor)
5. [Configuração do Python e Dependências](#5-configuração-do-python-e-dependências)
6. [Build do Frontend (React/Vite)](#6-build-do-frontend-reactvite)
7. [Arquivo .env de Produção](#7-arquivo-env-de-produção)
8. [Ajustes no settings.py para Produção](#8-ajustes-no-settingspy-para-produção)
9. [Preparar o Django (Migrate, Collectstatic, Superuser)](#9-preparar-o-django-migrate-collectstatic-superuser)
10. [Configuração do uWSGI para Produção](#10-configuração-do-uwsgi-para-produção)
11. [Configuração do Nginx (HTTP inicial)](#11-configuração-do-nginx-http-inicial)
12. [Serviço systemd para o uWSGI](#12-serviço-systemd-para-o-uwsgi)
13. [SSL com Let's Encrypt (HTTPS) + Ajustes Finais no settings.py](#13-ssl-com-lets-encrypt-https--ajustes-finais-no-settingspy)
14. [Firewall](#14-firewall)
15. [Permissões de Arquivos](#15-permissões-de-arquivos)
16. [Como Fazer Atualizações (Re-deploy)](#16-como-fazer-atualizações-re-deploy)
17. [Checklist Final](#17-checklist-final)
18. [Troubleshooting](#18-troubleshooting)

---

## Sobre este guia

> **Usuário do sistema:** Este guia usa `ubuntu` como nome de usuário em todos os exemplos. Se o seu servidor usa um usuário diferente (ex: `debian`, `admin`, o seu nome de login), **substitua `ubuntu` pelo seu usuário** em todos os comandos.
>
> Para saber qual é o seu usuário atual:
> ```bash
> whoami
> ```

---

## 1. Pré-requisitos do Servidor

### Requisitos mínimos

- **Sistema Operacional:** Ubuntu 22.04+ ou Debian 12+ (recomendado), mas qualquer distribuição Linux baseada em Debian funciona
- **Acesso:** SSH com usuário com permissão sudo
- **Domínio:** Um domínio apontando para o IP do servidor (ex: `labmanager.seudominio.com`)
- **RAM mínima:** 1 GB (recomendado 2 GB+)
- **Disco:** Pelo menos 10 GB livres

### Portas que precisam estar abertas

O servidor precisa ter as seguintes portas acessíveis na internet:

| Porta | Protocolo | Uso |
|-------|-----------|-----|
| 22    | TCP       | SSH (acesso ao servidor) |
| 80    | TCP       | HTTP (e validação do domínio pelo Let's Encrypt) |
| 443   | TCP       | HTTPS (acesso ao site) |

**Atenção:** Existem dois "firewalls" independentes que podem bloquear essas portas, e os dois precisam estar configurados:

**1. Firewall do provedor de nuvem** (externo ao servidor)

Se você usa AWS, OCI, GCP, DigitalOcean, Hetzner, Vultr ou similar, o provedor tem um firewall próprio no painel de controle. Você precisa criar regras de entrada (inbound rules) liberando as portas 80 e 443 antes de continuar, no caso de nada adianta configurar o Nginx se o tráfego é bloqueado antes de chegar ao servidor.

- **AWS:** Security Groups → Inbound Rules → Add Rule (HTTP e HTTPS de 0.0.0.0/0)
- **DigitalOcean:** Networking → Firewalls → Inbound Rules
- **Hetzner:** Firewalls → Add Rule (TCP 80 e TCP 443)
- **GCP:** VPC Network → Firewall Rules → Create Rule

**2. Firewall do sistema operacional (UFW)**

Configurado dentro do servidor. Faremos isso na etapa 14.

> **Se o site não abrir após a configuração:** O primeiro passo é verificar se a porta 80 está acessível pelo provedor, pois esse é o problema mais comum.

---

## 2. Instalação de Dependências do Sistema

Conecte ao servidor via SSH e execute:

```bash
# Atualizar o sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências essenciais
sudo apt install -y \
    build-essential \
    postgresql \
    postgresql-contrib \
    libpq-dev \
    nginx \
    curl \
    git \
    certbot \
    python3-certbot-nginx
```

> **Nota sobre Python:** O projeto usa Python 3.12. Não instale o Python pelo apt; o `uv` (instalado a seguir) pode gerenciar a versão do Python automaticamente, o que evita problemas de compatibilidade.

```bash
# Instalar Node.js 20+ (necessário para buildar o frontend)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar o uv (gerenciador de pacotes Python usado no projeto)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Aplicar as mudanças no PATH feitas pelo instalador do uv
source ~/.bashrc
# Se o comando uv não for encontrado após isso, tente:
# export PATH="$HOME/.local/bin:$PATH"
```

Verifique as instalações:

```bash
node --version    # v20.x.x
npm --version     # 10.x.x
psql --version    # psql 15+ ou 16+
nginx -v          # nginx/1.x.x
uv --version      # uv 0.x.x
```

---

## 3. Configuração do PostgreSQL

```bash
# Acessar o PostgreSQL como usuário postgres
sudo -u postgres psql
```

Dentro do shell do PostgreSQL, execute:

```sql
-- Criar o banco de dados
CREATE DATABASE lab_manager;

-- Criar o usuário (TROQUE a senha por uma forte!)
CREATE USER lab_manager_user WITH PASSWORD 'SUA_SENHA_FORTE_AQUI';

-- Configurações recomendadas para Django
ALTER ROLE lab_manager_user SET client_encoding TO 'utf8';
ALTER ROLE lab_manager_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE lab_manager_user SET timezone TO 'UTC';

-- Dar permissões ao usuário no banco
GRANT ALL PRIVILEGES ON DATABASE lab_manager TO lab_manager_user;
ALTER DATABASE lab_manager OWNER TO lab_manager_user;

-- Sair do psql
\q
```

Teste a conexão:

```bash
psql -U lab_manager_user -d lab_manager -h localhost -W
# Digite a senha quando solicitado. Se conectar, está OK.
# Use \q para sair.
```

> **Se der erro de autenticação:** Edite o arquivo `pg_hba.conf` para permitir
> conexão local com senha:
> ```bash
> sudo nano /etc/postgresql/*/main/pg_hba.conf
> ```
> Procure a linha com `local all all peer` e mude `peer` para `md5`.
> Depois reinicie o PostgreSQL:
> ```bash
> sudo systemctl restart postgresql
> ```

---

## 4. Clonar o Projeto no Servidor

```bash
# Criar o diretório do projeto
sudo mkdir -p /opt/lab-manager
sudo chown ubuntu:ubuntu /opt/lab-manager  # Adapte "ubuntu" para o seu usuário

# Clonar a branch master (branch de produção)
git clone -b master https://github.com/gustavogds/lab-manager.git /opt/lab-manager/app

# Entrar no diretório
cd /opt/lab-manager/app
```

---

## 5. Configuração do Python e Dependências

O `uv` pode baixar e instalar o Python 3.12 automaticamente, mesmo que ele não esteja disponível no sistema:

```bash
cd /opt/lab-manager/app

# Instalar o Python 3.12 via uv (baixa automaticamente se necessário)
uv python install 3.12

# Criar o ambiente virtual com Python 3.12
uv venv --python 3.12

# Ativar o ambiente virtual
source .venv/bin/activate

# Instalar as dependências do projeto
uv sync --frozen

# Verificar que o uWSGI foi instalado corretamente
uwsgi --version

# Desativar o ambiente virtual
deactivate
```

> **Se `uv sync --frozen` falhar:** Tente sem a flag `--frozen` para permitir que o uv resolva as dependências:
> ```bash
> uv sync
> ```
> Se ainda falhar com erros de compilação, certifique-se de que as dependências de build do sistema estão instaladas:
> ```bash
> deactivate
> sudo apt install -y build-essential libpq-dev
> source .venv/bin/activate
> uv sync --frozen
> ```

---

## 6. Build do Frontend (React/Vite)

```bash
cd /opt/lab-manager/app/client

# Instalar dependências do Node
npm install

# Buildar para produção
NODE_ENV=production npm run build
```

Verifique que os arquivos foram gerados:

```bash
ls /opt/lab-manager/app/server/staticfiles/client/
# Deve conter: assets/, index.html, .vite/
```

> **Importante:** O arquivo `.vite/manifest.json` é essencial. Sem ele, o Django
> não consegue carregar o frontend em produção. Se não existir, o build falhou.

---

## 7. Arquivo .env de Produção

Crie o arquivo `.env` dentro de `/opt/lab-manager/app/server/`:

```bash
nano /opt/lab-manager/app/server/.env
```

Conteúdo (ajuste todos os valores):

```ini
# ============================================
# BANCO DE DADOS
# ============================================
DB_NAME=lab_manager
DB_USER=lab_manager_user
DB_PASSWORD=SUA_SENHA_FORTE_AQUI
DB_HOST=localhost
DB_PORT=5432

# ============================================
# URL DO SITE
# ============================================
# Troque pelo seu domínio real
SITE_URL=https://labmanager.seudominio.com

# ============================================
# CHAVES SECRETAS
# ============================================
# Gere o SECRET_KEY com:
#   cd /opt/lab-manager/app && source .venv/bin/activate
#   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
#   deactivate
SECRET_KEY=cole_a_chave_gerada_aqui

# Gere JWT_SECRET e GUIDS_SECRET com (execute duas vezes, um valor para cada):
#   python3 -c "import secrets; print(secrets.token_urlsafe(64))"
JWT_SECRET=primeiro_valor_gerado_aqui
GUIDS_SECRET=segundo_valor_gerado_aqui

# ============================================
# EMAIL (para envio de emails reais)
# ============================================
# Exemplo com Gmail (use App Password, não a senha normal):
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seuemail@gmail.com
EMAIL_HOST_PASSWORD=sua_app_password_do_gmail
DEFAULT_FROM_EMAIL=seuemail@gmail.com

# Se não quiser configurar email agora, deixe assim (emails saem no log do uWSGI):
# EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

Proteja o arquivo:

```bash
chmod 600 /opt/lab-manager/app/server/.env
```

---

## 8. Verificar o settings.py de Produção

A branch `master` já inclui todas as configurações de produção no `settings.py` — você **não precisa editar esse arquivo**, a menos que esteja fazendo o deploy com um domínio diferente.

O que já está configurado no código:

- `DEBUG = False`
- `SECRET_KEY`, `JWT_SECRET`, `GUIDS_SECRET` lidos do `.env`
- WhiteNoise no middleware para servir arquivos estáticos
- Cookies e HTTPS com configurações de segurança completas (`SECURE_SSL_REDIRECT = True`, HSTS, etc.)
- Logging para arquivo em `server/storage/logs/django.log`

### Único ajuste necessário: ALLOWED_HOSTS

O `settings.py` deve conter o seu domínio em `ALLOWED_HOSTS`. Se você está fazendo o deploy, edite o arquivo:

```bash
nano /opt/lab-manager/app/server/config/settings.py
```

Localize e atualize a linha de `ALLOWED_HOSTS` com o seu domínio no lugar de `seu-dominio.com`:

```python
ALLOWED_HOSTS = ["seu-dominio.com", "127.0.0.1", "localhost"]
```

> **Atenção:** O `settings.py` já tem `SECURE_SSL_REDIRECT = True` ativo. Isso significa que o Django redireciona qualquer acesso HTTP para HTTPS automaticamente. Por isso, **não tente testar o site pelo navegador antes de configurar o SSL** (etapa 13) — você só vai ver erros de redirecionamento. O Nginx HTTP da etapa 11 é necessário apenas para o Let's Encrypt validar o domínio.

---

## 9. Preparar o Django (Migrate, Collectstatic, Superuser)

Primeiro, crie os diretórios de armazenamento que o Django precisa. É importante fazer isso antes de rodar o Django:

```bash
mkdir -p /opt/lab-manager/app/server/storage/files
mkdir -p /opt/lab-manager/app/server/storage/private/objects
mkdir -p /opt/lab-manager/app/server/storage/private/thumbs
mkdir -p /opt/lab-manager/app/server/storage/upload-tmp
mkdir -p /opt/lab-manager/app/server/storage/logs
```

Agora execute os comandos do Django:

```bash
cd /opt/lab-manager/app

# Ativar o ambiente virtual
source .venv/bin/activate

# Rodar as migrações do banco de dados
python server/manage.py migrate

# Coletar todos os arquivos estáticos (inclui o build do frontend)
python server/manage.py collectstatic --noinput

# Criar o superusuário (admin) do Django
python server/manage.py createsuperuser
# Siga as instruções: informe email, nome, senha

# Desativar o ambiente virtual
deactivate
```

Verifique se o `collectstatic` copiou os arquivos do frontend:

```bash
ls /opt/lab-manager/app/server/staticfiles/client/.vite/
# Deve existir: manifest.json
```

---

## 10. Configuração do uWSGI para Produção

Crie o arquivo de configuração de produção:

```bash
nano /opt/lab-manager/app/extras/uwsgi-production.ini
```

Conteúdo:

```ini
[uwsgi]
; === Master process ===
master = true
enable-threads = true

; === Caminhos do projeto ===
chdir = /opt/lab-manager/app/server
home = /opt/lab-manager/app/.venv

; === Módulo WSGI ===
module = config.wsgi:application

; === Variáveis de ambiente ===
env = LANG=en_US.UTF-8
env = LC_ALL=en_US.UTF-8
env = LC_CTYPE=en_US.UTF-8
env = DJANGO_SETTINGS_MODULE=config.settings
env = PYTHON_ENV=production

; === Socket Unix (Nginx se comunica por aqui) ===
socket = /opt/lab-manager/app/server/storage/lab-manager.sock
chmod-socket = 660

; === Workers ===
; Regra geral: processes = (2 * num_cpus) + 1
; Para um servidor com 2 CPUs: 5 processos, ajuste conforme seu servidor
processes = 5
threads = 2

; === Limites de segurança ===
max-requests = 5000
max-requests-delta = 200
harakiri = 120
harakiri-verbose = true

; === Gerenciamento de processos ===
die-on-term = true
reload-mercy = 60
worker-reload-mercy = 60
vacuum = true

; === Offloading ===
offload-threads = 4

; === Buffer para headers grandes ===
buffer-size = 65535

; === Logging ===
logdate = [%%Y-%%m-%%dT%%H:%%M:%%S.000Z]
logformat = %(ftime) (%(addr)) %(method) %(uri) => %(status) in %(msecs)ms reqlen:%(cl) reslen:%(rsize) pid:%(pid)
logformat-strftime = true
logto = /opt/lab-manager/app/server/storage/logs/uwsgi.log
log-maxsize = 10485760

; === PID file ===
pidfile = /opt/lab-manager/app/server/storage/uwsgi.pid
```

---

## 11. Configuração do Nginx (HTTP inicial)

Nesta etapa, configuramos o Nginx para servir o site via **HTTP** (porta 80). O HTTPS será adicionado na etapa 13, depois que tudo estiver funcionando.

Crie o arquivo de configuração:

```bash
sudo nano /etc/nginx/sites-available/lab-manager
```

Conteúdo:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name labmanager.seudominio.com;

    # Tamanho máximo de upload
    client_max_body_size 50M;

    # Headers de segurança básicos
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Arquivos estáticos, que são servidos diretamente pelo Nginx
    location /static/ {
        alias /opt/lab-manager/app/server/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Arquivos de mídia, que são uploads de usuários
    location /media/ {
        alias /opt/lab-manager/app/server/storage/files/;
        expires 7d;
        add_header Cache-Control "public";
        access_log off;
    }

    # Conteúdo privado - só acessível via redirect interno do Django (X-Accel-Redirect)
    location /media/object/ {
        alias /opt/lab-manager/app/server/storage/private/objects/;
        internal;
    }

    location /media/thumb/ {
        alias /opt/lab-manager/app/server/storage/private/thumbs/;
        internal;
    }

    # Tudo o mais vai para o Django via uWSGI
    location / {
        include uwsgi_params;
        uwsgi_pass unix:/opt/lab-manager/app/server/storage/lab-manager.sock;

        uwsgi_param Host $host;
        uwsgi_param X-Real-IP $remote_addr;
        uwsgi_param X-Forwarded-For $proxy_add_x_forwarded_for;
        uwsgi_param X-Forwarded-Proto $scheme;

        uwsgi_read_timeout 120s;
        uwsgi_send_timeout 120s;
    }

    # Necessário para o Let's Encrypt validar o domínio (etapa 13)
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
}
```

Ative o site e inicie o Nginx:

```bash
# Criar link simbólico para ativar o site
sudo ln -s /etc/nginx/sites-available/lab-manager /etc/nginx/sites-enabled/

# Remover o site padrão
sudo rm -f /etc/nginx/sites-enabled/default

# Testar a configuração do Nginx
sudo nginx -t

# Se o teste passou, iniciar o Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 12. Serviço systemd para o uWSGI

Crie o serviço systemd que vai gerenciar o uWSGI:

```bash
sudo nano /etc/systemd/system/lab-manager.service
```

Conteúdo (**adapte `ubuntu` para o seu usuário nas linhas `User=` e `Group=`**):

```ini
[Unit]
Description=Lab Manager uWSGI Application
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=notify
User=ubuntu
Group=ubuntu

WorkingDirectory=/opt/lab-manager/app/server

; O ExecStart usa o caminho completo do binário dentro da venv.
; Isso é necessário porque o systemd não executa uma sessão de shell
; e portanto não tem o ambiente virtual ativado.
ExecStart=/opt/lab-manager/app/.venv/bin/uwsgi --ini /opt/lab-manager/app/extras/uwsgi-production.ini
ExecReload=/bin/kill -HUP $MAINPID
ExecStop=/bin/kill -INT $MAINPID

Restart=on-failure
RestartSec=5

KillSignal=SIGQUIT
TimeoutStopSec=30

PrivateTmp=true
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
```

Ative o serviço:

```bash
# Recarregar as configurações do systemd
sudo systemctl daemon-reload

# Iniciar o serviço
sudo systemctl start lab-manager

# Verificar o status (deve aparecer "active (running)")
sudo systemctl status lab-manager

# Habilitar início automático no boot
sudo systemctl enable lab-manager
```

Se o serviço não iniciar, veja os logs para entender o problema:

```bash
sudo journalctl -u lab-manager -xe --no-pager -n 50
```

### Verificar se o serviço subiu

Confirme que o uWSGI iniciou e o socket foi criado:

```bash
# O serviço deve estar "active (running)"
sudo systemctl status lab-manager

# O socket deve existir
ls /opt/lab-manager/app/server/storage/lab-manager.sock
```

> **Não tente abrir o site no navegador ainda.** Como o `settings.py` já tem `SECURE_SSL_REDIRECT = True`, qualquer acesso HTTP vai resultar em erro de redirecionamento até o SSL estar configurado. Vá direto para a etapa 13.

> **Se o serviço não iniciar:** Veja os logs com `sudo journalctl -u lab-manager -xe --no-pager -n 50` e consulte a seção de [Troubleshooting](#18-troubleshooting).

> **Permissões do socket:** O Nginx (que roda como `www-data`) precisa acessar o socket Unix criado pelo uWSGI. Se você ver erros de "Permission denied" no socket, adicione o usuário `www-data` ao grupo do seu usuário:
> ```bash
> sudo usermod -aG ubuntu www-data  # Adapte "ubuntu" para o seu usuário
> sudo systemctl restart nginx
> ```

---

## 13. SSL com Let's Encrypt (HTTPS)

Antes de continuar, certifique-se de que:
- O uWSGI está rodando (etapa 12 concluída)
- O domínio está apontando para o IP do servidor
- As portas 80 e 443 estão abertas no provedor de nuvem (etapa 1)

### 13.1 Obter o certificado SSL

```bash
# O Certbot vai detectar o site Nginx e configurar o SSL automaticamente
sudo certbot --nginx -d labmanager.seudominio.com
```

O Certbot vai:
1. Verificar que você controla o domínio (usa a porta 80 e o `location /.well-known/` configurado no Nginx)
2. Obter o certificado SSL
3. Modificar automaticamente o arquivo de configuração do Nginx para HTTPS
4. Configurar redirecionamento HTTP → HTTPS

Após o Certbot rodar, teste e reinicie o Nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

Agora acesse o site e verifique:
- `https://labmanager.seudominio.com` carrega corretamente
- O painel admin (`/admin/`) está acessível
- O login funciona
- O upload de arquivos funciona

### 13.2 Renovação automática do certificado

O Certbot já configura a renovação automática. Verifique:

```bash
# Testar a renovação (dry-run - não faz nada de verdade)
sudo certbot renew --dry-run

# Ver o timer de renovação
sudo systemctl list-timers | grep certbot
```

---

## 14. Firewall

> **Atenção:** Execute os comandos abaixo **nesta ordem exata**. Habilitar o firewall antes de permitir SSH vai bloquear permanentemente o seu acesso ao servidor.

```bash
# 1. Primeiro: permitir SSH (crítico, sem isso você perde o acesso!)
sudo ufw allow OpenSSH

# 2. Permitir HTTP e HTTPS
sudo ufw allow 'Nginx Full'

# 3. Verificar as regras ANTES de ativar
sudo ufw show added

# 4. Ativar o firewall
sudo ufw enable

# 5. Verificar o status final
sudo ufw status verbose
```

Resultado esperado:

```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
OpenSSH (v6)               ALLOW       Anywhere (v6)
Nginx Full (v6)            ALLOW       Anywhere (v6)
```

> **Lembre-se:** O UFW cuida do firewall do sistema operacional. Se você usa um provedor de nuvem, o firewall do provedor (configurado no painel web) também precisa ter as portas 22, 80 e 443 abertas, essas são camadas independentes.

---

## 15. Permissões de Arquivos

Garanta que o usuário do sistema tenha as permissões corretas em todos os arquivos:

```bash
# O usuário deve ser dono de tudo em /opt/lab-manager
# (adapte "ubuntu" para o seu usuário)
sudo chown -R ubuntu:ubuntu /opt/lab-manager/

# Diretório de storage precisa ter permissão de escrita
chmod -R 755 /opt/lab-manager/app/server/storage/

# O .env deve ser restrito (só o dono pode ler)
chmod 600 /opt/lab-manager/app/server/.env
```

Verifique os diretórios de storage:

```bash
ls -la /opt/lab-manager/app/server/storage/
# Deve conter: files/, private/, upload-tmp/, logs/
# e após o primeiro uso: lab-manager.sock, uwsgi.pid
```

---

## 16. Como Fazer Atualizações (Re-deploy)

Sempre que precisar atualizar o projeto em produção:

```bash
# 1. Ir para o diretório do projeto
cd /opt/lab-manager/app

# 2. Puxar as alterações do Git
git pull origin master

# 3. Atualizar dependências Python (se mudaram)
source .venv/bin/activate
uv sync --frozen
deactivate

# 4. Atualizar e buildar o frontend (se mudou)
cd client
npm install
NODE_ENV=production npm run build
cd ..

# 5. Rodar migrações e coletar estáticos
source .venv/bin/activate
python server/manage.py migrate
python server/manage.py collectstatic --noinput
deactivate

# 6. Reiniciar o uWSGI
sudo systemctl restart lab-manager

# 7. Verificar se está rodando
sudo systemctl status lab-manager
```

### Script de deploy automático (opcional)

Crie em `/opt/lab-manager/deploy.sh`:

```bash
#!/bin/bash
set -e

APP_DIR="/opt/lab-manager/app"

echo ">>> Puxando alterações..."
cd "$APP_DIR"
git pull origin master

echo ">>> Atualizando dependências Python..."
source "$APP_DIR/.venv/bin/activate"

uv sync --frozen

echo ">>> Buildando frontend..."
cd "$APP_DIR/client"
npm install
NODE_ENV=production npm run build
cd "$APP_DIR"

echo ">>> Rodando migrações e collectstatic..."
python server/manage.py migrate
python server/manage.py collectstatic --noinput

deactivate

echo ">>> Reiniciando uWSGI..."
sudo systemctl restart lab-manager

echo ">>> Deploy concluído!"
```

```bash
chmod +x /opt/lab-manager/deploy.sh
# Para usar: /opt/lab-manager/deploy.sh
```

---

## 17. Checklist Final

Antes de considerar o deploy completo, verifique cada item:

### Segurança

- [ ] `SECRET_KEY` foi trocada e está no `.env`
- [ ] `DEBUG = False`
- [ ] `ALLOWED_HOSTS` contém apenas o seu domínio
- [ ] `JWT_SECRET` foi trocada e está no `.env`
- [ ] `GUIDS_SECRET` foi trocada e está no `.env`
- [ ] Cookies estão com `Secure = True` e `SameSite = "Lax"`
- [ ] HTTPS está ativo e funcionando
- [ ] `SECURE_SSL_REDIRECT = True` está ativo
- [ ] O arquivo `.env` tem permissão `600` (só o dono lê)
- [ ] O firewall UFW está ativo

### Funcionalidade

- [ ] O banco de dados PostgreSQL está rodando e acessível
- [ ] As migrações foram executadas com sucesso (`migrate`)
- [ ] O `collectstatic` foi executado
- [ ] O frontend foi buildado (`npm run build`)
- [ ] O `manifest.json` existe em `server/staticfiles/client/.vite/`
- [ ] O superusuário foi criado (`createsuperuser`)
- [ ] O uWSGI está rodando (`systemctl status lab-manager`)
- [ ] O Nginx está rodando (`systemctl status nginx`)
- [ ] O site abre no navegador sem erros
- [ ] O painel admin (`/admin/`) está acessível

### Infraestrutura

- [ ] O serviço uWSGI inicia automaticamente no boot
- [ ] O Nginx inicia automaticamente no boot
- [ ] O PostgreSQL inicia automaticamente no boot
- [ ] O certificado SSL renova automaticamente (`certbot renew --dry-run`)
- [ ] O usuário `www-data` está no grupo do usuário do servidor (para acessar o socket)
- [ ] Os diretórios de storage existem e têm permissão de escrita

---

## 18. Troubleshooting

### O site mostra "502 Bad Gateway"

O Nginx não consegue se comunicar com o uWSGI.

```bash
# Verificar se o uWSGI está rodando
sudo systemctl status lab-manager

# Ver logs do uWSGI
sudo journalctl -u lab-manager --no-pager -n 50

# Verificar se o socket existe
ls -la /opt/lab-manager/app/server/storage/lab-manager.sock

# Se o socket não existir, o uWSGI não iniciou (veja os logs acima).
# Se existir mas der "Permission denied", adicione www-data ao grupo do usuário:
sudo usermod -aG ubuntu www-data  # Adapte "ubuntu"
sudo systemctl restart nginx
```

### O site mostra "500 Internal Server Error"

Erro no Django.

```bash
# Ver logs do Django
cat /opt/lab-manager/app/server/storage/logs/django.log

# Ver logs do uWSGI
cat /opt/lab-manager/app/server/storage/logs/uwsgi.log

# Testar o Django manualmente
cd /opt/lab-manager/app
source .venv/bin/activate
python server/manage.py check --deploy
deactivate
```

### Arquivos estáticos não carregam (CSS/JS ausentes)

```bash
# Verificar se o collectstatic foi executado
ls /opt/lab-manager/app/server/staticfiles/

# Verificar se o manifest do frontend existe
ls /opt/lab-manager/app/server/staticfiles/client/.vite/manifest.json

# Verificar configuração do Nginx
sudo nginx -t

# Verificar se o WhiteNoise está no middleware
grep -n "whitenoise" /opt/lab-manager/app/server/config/settings.py
```

### Erro "DisallowedHost"

O domínio que você está acessando não está no `ALLOWED_HOSTS`.

```bash
# Ver o valor atual
grep ALLOWED_HOSTS /opt/lab-manager/app/server/config/settings.py
```

Adicione o domínio correto no `settings.py` e reinicie:

```bash
sudo systemctl restart lab-manager
```

### Erro de conexão com o banco de dados

```bash
# Verificar se o PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão manual
psql -U lab_manager_user -d lab_manager -h localhost -W

# Verificar as credenciais no .env
cat /opt/lab-manager/app/server/.env
```

### O uWSGI não inicia

```bash
# Ver logs detalhados
sudo journalctl -u lab-manager -xe --no-pager

# Testar o uWSGI manualmente para ver o erro exato no terminal
cd /opt/lab-manager/app
source .venv/bin/activate
uwsgi --ini extras/uwsgi-production.ini
# Use Ctrl+C para parar
deactivate

# Erros comuns:
# - "No module named config": verifique o chdir no uwsgi-production.ini
# - "invalid home": verifique o home (caminho da venv) no uwsgi-production.ini
# - "bind(): Permission denied": verifique se o diretório storage existe e tem permissão de escrita
```

### Uploads de arquivo não funcionam

```bash
# Verificar se os diretórios de storage existem no lugar correto
ls -la /opt/lab-manager/app/server/storage/
# Deve conter: files/, private/, upload-tmp/, logs/

# Verificar permissões
ls -la /opt/lab-manager/app/server/storage/files/
ls -la /opt/lab-manager/app/server/storage/private/

# Corrigir permissões se necessário (adapte "ubuntu")
sudo chown -R ubuntu:ubuntu /opt/lab-manager/app/server/storage/
chmod -R 755 /opt/lab-manager/app/server/storage/

# Verificar o limite de tamanho no Nginx
grep client_max_body_size /etc/nginx/sites-available/lab-manager
```

### Emails não são enviados

```bash
# Verificar a configuração no .env
grep EMAIL /opt/lab-manager/app/server/.env

# Testar envio de email pelo Django
cd /opt/lab-manager/app
source .venv/bin/activate
python server/manage.py shell -c "
from django.core.mail import send_mail
send_mail('Teste', 'Corpo do email', None, ['seuemail@gmail.com'])
"
deactivate
```

> **Gmail:** Use uma "App Password" (Senha de App), não a senha normal da conta.
> Ative a verificação em 2 etapas e gere a senha em: Conta Google > Segurança > Senhas de App.

### O site não abre (conexão recusada ou timeout)

O problema provavelmente é no firewall, não no servidor.

```bash
# Verificar se o Nginx está escutando na porta 80
sudo ss -tlnp | grep :80

# Verificar status do UFW
sudo ufw status

# Se o UFW estiver ativo mas o site não abrir, verifique o firewall do provedor de nuvem
# (AWS Security Groups, DigitalOcean Firewall, etc.) - veja a etapa 1.
```

---

## Arquitetura Final

```
Internet
    |
    v
[Firewall do Provedor] --- Portas 80 e 443 abertas no painel do provedor
    |
    v
[Firewall UFW] --- Regras: OpenSSH + Nginx Full
    |
    v
[Nginx] --- Porta 80 → redireciona para 443
    |        --- Porta 443 (SSL/HTTPS)
    |        --- Serve /static/ diretamente
    |        --- Serve /media/ diretamente
    |
    v (socket Unix)
[uWSGI] --- 5 workers, 2 threads cada
    |
    v
[Django] --- config.wsgi:application
    |
    v
[PostgreSQL] --- lab_manager database
```

```
/opt/lab-manager/
  app/
    client/          # Código fonte React (só necessário no build)
    server/
      config/        # Django settings, urls, wsgi
      storage/       # Uploads, logs, socket (escrita em runtime)
        files/       # Media uploads (MEDIA_ROOT)
        private/     # Objetos e thumbnails privados
        logs/        # django.log, uwsgi.log
        lab-manager.sock  # Socket uWSGI <-> Nginx
      staticfiles/   # Arquivos estáticos coletados
        client/      # Frontend buildado (JS/CSS)
    extras/
      uwsgi.ini               # Config desenvolvimento
      uwsgi-production.ini    # Config produção
    .venv/           # Ambiente virtual Python
```

# Lab Manager

Guia completo para executar o projeto em **ambiente local Linux (máquina limpa)**, com foco em desenvolvimento.

Este projeto usa:

- Backend: Django + PostgreSQL
- Frontend: Vite + React
- Gerenciador Python: `uv`
- Execução estilo deploy local: `uWSGI`

---

## 1) Pré-requisitos (Ubuntu/Debian)

Abra o terminal e rode:

```bash
sudo apt update
sudo apt install -y \
	git curl ca-certificates \
	build-essential pkg-config \
	python3 python3-pip python3-venv \
	libpq-dev \
	postgresql postgresql-contrib \
	nodejs npm
```

Verifique versões instaladas:

```bash
python3 --version
node --version
npm --version
psql --version
```

> Recomendado: Python 3.12+.

---

## 2) Instalar o `uv`

Instale o `uv` (Astral):

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Reabra o terminal e confirme:

```bash
uv --version
```

---

## 3) Clonar o projeto

```bash
git clone <URL_DO_REPOSITORIO>
cd lab-manager
```

---

## 4) Configurar PostgreSQL

Garanta que o serviço está ativo:

```bash
sudo systemctl enable postgresql
sudo systemctl start postgresql
sudo systemctl status postgresql
```

Entre no PostgreSQL como usuário admin:

```bash
sudo -u postgres psql
```

Crie banco e usuário (troque os valores):

```sql
CREATE DATABASE lab_manager;
CREATE USER lab_manager_user WITH PASSWORD 'sua_senha_forte';
GRANT ALL PRIVILEGES ON DATABASE lab_manager TO lab_manager_user;
\q
```

---

## 5) Configurar variáveis de ambiente (`.env`)

Crie o arquivo `server/.env`:

```bash
cat > server/.env << 'EOF'
DB_NAME=lab_manager
DB_USER=lab_manager_user
DB_PASSWORD=sua_senha_forte
DB_HOST=localhost
DB_PORT=5432

# Opcionais (já têm default no projeto)
SITE_URL=http://localhost:8000
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EOF
```

> Se preferir, crie o arquivo manualmente no editor.

---

## 6) Instalar dependências Python com `uv`

Na raiz do projeto (`lab-manager`):

```bash
uv sync --group dev
```

Isso cria/atualiza o ambiente virtual em `.venv` e instala tudo do `pyproject.toml` + `uv.lock`.

Ative o ambiente virtual (fluxo recomendado):

```bash
. .venv/bin/activate
```

Depois disso, você pode usar `python`, `uwsgi` e outros comandos normalmente, sem `uv run`.

Teste rápido:

```bash
python --version
python server/manage.py check
```

---

## 7) Instalar dependências do frontend

```bash
cd client
npm install
npm run build
cd ..
```

---

## 8) Preparar banco e arquivos estáticos

Na raiz do projeto:

```bash
python server/manage.py migrate
python server/manage.py collectstatic --noinput
```

Opcional (acesso ao admin):

```bash
python server/manage.py createsuperuser
```

---

## 9) Rodar em desenvolvimento
### Desenvolvimento estilo deploy local com `uWSGI`

Na raiz do projeto:

```bash
uwsgi extras/uwsgi.ini
```

Esse modo usa o arquivo `extras/uwsgi.ini` e sobe a aplicação em `http://localhost:8000`.

---

## 10) Verificação final

Execute:

```bash
python server/manage.py check
python server/manage.py test
```

Se os comandos acima rodarem sem erro, seu ambiente local está pronto.

---

## 11) Problemas comuns

### Erro de conexão com banco

- Verifique se PostgreSQL está rodando: `sudo systemctl status postgresql`
- Revise `server/.env` (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`)
- Teste login manual:

```bash
psql -h localhost -U lab_manager_user -d lab_manager
```

### Porta 8000 ocupada

```bash
sudo lsof -i :8000
```

Mate o processo ou troque a porta no comando de execução.

### Frontend não atualiza dependências

```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

---

## 12) Atualizar dependências com `uv`

Na raiz do projeto:

```bash
uv lock --upgrade
uv sync --group dev
```

Para atualizar só um pacote:

```bash
uv lock --upgrade-package django
uv sync --group dev
```

---

## 13) Alternativa sem ativar `.venv`

Se você preferir não ativar o ambiente virtual, rode os mesmos comandos prefixando com `uv run`.

Exemplos:

```bash
uv run python server/manage.py migrate
uv run python server/manage.py runserver 0.0.0.0:8000
uv run uwsgi extras/uwsgi.ini
```

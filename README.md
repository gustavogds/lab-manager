# lab-manager

# Ubuntu-Linux Installation Guide

Run those commands to setup virtual environment:

```
python3 -m venv env
. env/bin/activate
pip install -r server/requirements-dev.txt
```

Run those commands to setup server and client:

```
cd client/
npm install
npm run build
```

Next step is to setup the server. Make sure you have PostgreSQL installed and running on your machine.
You can use the following commands to create a database and user:

```
sudo -u postgres psql
CREATE DATABASE nome_do_banco;
CREATE USER nome_do_usuario WITH PASSWORD 'senha_do_usuario';
GRANT ALL PRIVILEGES ON DATABASE nome_do_banco TO nome_do_usuario;
```

Now you need to create a `.env` file in the `server` directory with the following content:

```
DB_NAME=<Database Name>
DB_USER=<Database User>
DB_PASSWORD=<Database Password>
DB_PORT=<Database Port>
```

Example:

```
DB_NAME=lab_manager
DB_USER=gustavo
DB_PASSWORD=123
DB_PORT=5432 - (Use this port)
```

Then run the following commands to setup the server:

```
cd ../
python server/manage.py migrate
python server/manage.py collectstatic
```

Finally, you can run the server with the following command:

```
uwsgi extras/uwsgi.ini
```

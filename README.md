# lab-manager

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
cd ../server
python manage.py migrate
python manage.py collectstatic
```
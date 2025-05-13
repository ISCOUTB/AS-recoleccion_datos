set -e
set -x
python3 -m app.database
python3 -m alembic upgrade head
python3 -m app.seed_database


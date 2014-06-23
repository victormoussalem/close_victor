Data Starter
============

Starter app setup for data experimental projects.

To run the local webserver in debug mode:

```
python run.py
```
To run in production mode:
```
foreman start
```

Add environment variables to `.env` and make sure you have [autoenv](https://github.com/kennethreitz/autoenv) installed (via the git install method).

Don't forget to add the working directory to `$PYTHONPATH` so module imports work.

```
export PYTHONPATH=`pwd`
```

####Manager
The manager script provides convenience around some common app utilities.

```
python manager.py db migrate
python manager.py db upgrade

python manager.py db_init  # Creates initial model tables in a fresh database

python manager.py run      # Runs app in debug mode locally
```

Add `manager.py` to a command-line alias for easier usage. If using `autoenv`:

```
echo alias app=\'python manager.py\' >> .env
```
(Note, this will break local foreman commands, but now you can use `app run` instead. To activate the above command, cd in and out of your working directory or `source .env`.)

If you run db_init and there are existing migrations in the `migrations/versions` directory, Alembic will complain your database isn't up to date. You can remove existing migrations to make this work for now, but if you'll be pushing to a remote app with a migration history, don't do this!


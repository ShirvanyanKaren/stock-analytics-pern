web: npm start && gunicorn -w 4 -k uvicorn.workers.UvicornWorker python.main:app
# worker: cd python && uvicorn main:app --host=127.0.0.1 --port=${PORT:-8000}
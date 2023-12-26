web: npm start & gunicorn -w 4 -k uvicorn.workers.UvicornWorker python.main:app
worker: uvicorn python.main:app --workers 4
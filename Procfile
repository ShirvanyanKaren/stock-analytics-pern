web: npm start & gunicorn -w 2 -k uvicorn.workers.UvicornWorker python.main:app --log-level debug --reload
# worker: uvicorn python.main:app --workers 4
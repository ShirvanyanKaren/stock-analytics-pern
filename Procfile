web: npm start & gunicorn -k uvicorn.workers.UvicornWorker python.main:app --bind 0.0.0.0:${PORT} 

# web: npm start & gunicorn -k uvicorn.workers.UvicornWorker python.main:app --bind 127.0.0.1:${8000} --log-level debug --reload

# web: npm start & gunicorn uvicorn.workers.UvicornWorker python.main:app --log-level debug --reload
# worker: uvicorn python.main:app --workers 4

npm start & uvicorn python.main:app --reload
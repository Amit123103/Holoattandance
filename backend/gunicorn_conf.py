# Gunicorn configuration file
import multiprocessing
import os

# Creating a specific configuration to override any defaults
bind = f"0.0.0.0:{os.getenv('PORT', '10000')}"

# STRICTLY enforce 1 worker to prevent OOM on free tier
workers = 1
threads = 4
timeout = 120
worker_class = "uvicorn.workers.UvicornWorker"

# Logging
loglevel = "info"
accesslog = "-"
errorlog = "-"

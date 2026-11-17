FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

COPY requirements.txt ./
RUN python -m pip install --no-cache-dir -r requirements.txt

RUN groupadd --system app && useradd --system --gid app --home-dir /app app \
    && mkdir -p /app/data \
    && chown app:app /app/data

COPY --chown=app:app backend/ ./backend/
COPY --chown=app:app public/ ./public/
COPY --chown=app:app server.py ./

USER app

EXPOSE 8000

CMD ["python", "server.py"]

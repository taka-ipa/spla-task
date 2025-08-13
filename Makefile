up:
	docker compose up -d --build
down:
	docker compose down -v
logs:
	docker compose logs -f --tail=100 backend frontend db
ps:
	docker compose ps

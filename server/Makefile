POSTGRES_USER ?= user
POSTGRES_PASSWORD ?= password
POSTGRES_DB ?= social_media
DB_URL ?= postgres://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@localhost:5432/$(POSTGRES_DB)?sslmode=disable

.PHONY: migrate-create migrate-up migrate-down

migrate-create:
	migrate create -ext sql -dir migrations -seq $(name)

migrate-up:
	migrate -path migrations -database "$(DB_URL)" up

migrate-down:
	migrate -path migrations -database "$(DB_URL)" down

# Variables
BINARY_NAME=api
MAIN_PACKAGE=./cmd/api
POSTGRES_USER ?= user
POSTGRES_PASSWORD ?= password
POSTGRES_DB ?= social_media
DB_URL ?= postgres://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@localhost:5432/$(POSTGRES_DB)?sslmode=disable

.PHONY: build run test lint migrate-create migrate-up migrate-down sqlc-generate

build:
	go build -o bin/$(BINARY_NAME) $(MAIN_PACKAGE)

run:
	go run $(MAIN_PACKAGE)

test:
	go test -v ./...

lint:
	go vet ./...

migrate-create:
	migrate create -ext sql -dir migrations -seq $(name)

migrate-up:
	migrate -path migrations -database "$(DB_URL)" up

migrate-down:
	migrate -path migrations -database "$(DB_URL)" down

sqlc-generate:
	sqlc generate

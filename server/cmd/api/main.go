package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/hrutav-modha/social-media-app/server/internal/auth"
	"github.com/hrutav-modha/social-media-app/server/internal/config"
	customMiddleware "github.com/hrutav-modha/social-media-app/server/internal/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/redis/go-redis/v9"
)

func main() {
	// 1. Load env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading from environment")
	}

	// 2. Load config
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	// 2.5 Initialize JWT
	if err := auth.InitJWT(cfg.JWTPrivateKey, cfg.JWTPublicKey); err != nil {
		log.Fatalf("failed to initialize JWT: %v", err)
	}

	// 3. Connect to DB (PostgreSQL)
	dbPool, err := pgxpool.New(context.Background(), cfg.DBURL)
	if err != nil {
		log.Fatalf("failed to connect to DB: %v", err)
	}
	defer dbPool.Close()

	if err := dbPool.Ping(context.Background()); err != nil {
		log.Fatalf("DB ping failed: %v", err)
	}
	log.Println("Successfully connected to DB")

	// 4. Connect to Redis
	rdb := redis.NewClient(&redis.Options{
		Addr: cfg.RedisURL,
	})
	defer rdb.Close()

	if err := rdb.Ping(context.Background()).Err(); err != nil {
		log.Fatalf("failed to connect to Redis: %v", err)
	}
	log.Println("Successfully connected to Redis")

	// 5. Connect to MinIO
	minioClient, err := minio.New(cfg.MinioEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.MinioAccessKey, cfg.MinioSecretKey, ""),
		Secure: false, // Set to true if using TLS
	})
	if err != nil {
		log.Fatalf("failed to connect to MinIO: %v", err)
	}
	_ = minioClient // For now, use to avoid unused variable error
	log.Println("Successfully connected to MinIO")

	// 6. Register Routes
	r := SetupRouter(cfg)

	// 7. Start Server with Graceful Shutdown
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}

	go func() {
		log.Printf("Starting server on port %s...", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")
}

func SetupRouter(cfg *config.Config) *chi.Mux {
	r := chi.NewRouter()
	r.Use(customMiddleware.RequestID)
	r.Use(customMiddleware.Logger)
	r.Use(customMiddleware.Recoverer)
	r.Use(customMiddleware.CORS(cfg.CORSAllowedOrigins))

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Social Media App API is running!"))
	})

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})
	return r
}

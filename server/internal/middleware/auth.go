package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/hrutav-modha/social-media-app/server/internal/auth"
)

const (
	// UserIDKey is the key used to store and retrieve the userID from the context.
	UserIDKey contextKey = "userID"
)

// Auth is a middleware that extracts the Bearer token from the Authorization header,
// validates the JWT, and attaches the userID to the request context.
// It returns a 401 Unauthorized response if the token is missing or invalid.
func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Unauthorized: missing authorization header", http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Unauthorized: invalid authorization header format", http.StatusUnauthorized)
			return
		}

		tokenString := parts[1]
		userID, err := auth.ValidateAccessToken(tokenString)
		if err != nil {
			http.Error(w, "Unauthorized: invalid or expired token", http.StatusUnauthorized)
			return
		}

		// Attach userID to context
		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetUserID returns the userID from the context if it exists.
func GetUserID(ctx context.Context) string {
	if id, ok := ctx.Value(UserIDKey).(string); ok {
		return id
	}
	return ""
}

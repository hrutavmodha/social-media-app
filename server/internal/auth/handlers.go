package auth

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/redis/go-redis/v9"
)

type AuthHandler struct {
	rdb *redis.Client
}

func NewAuthHandler(rdb *redis.Client) *AuthHandler {
	return &AuthHandler{rdb: rdb}
}

// Refresh handles POST /api/v1/auth/refresh
func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		http.Error(w, "missing refresh token", http.StatusUnauthorized)
		return
	}

	oldToken := cookie.Value
	newToken, userID, err := RotateRefreshToken(r.Context(), h.rdb, oldToken)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	accessToken, err := GenerateAccessToken(userID)
	if err != nil {
		http.Error(w, "failed to generate access token", http.StatusInternalServerError)
		return
	}

	// Set the new refresh token in a cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    newToken,
		Path:     "/api/v1/auth",
		Expires:  time.Now().Add(RefreshTokenTTL),
		HttpOnly: true,
		Secure:   true, // Should be true in production
		SameSite: http.SameSiteStrictMode,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"access_token": accessToken,
	})
}

// Logout handles POST /api/v1/auth/logout
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh_token")
	if err == nil {
		// If cookie exists, delete it from Redis
		err = DeleteRefreshToken(r.Context(), h.rdb, cookie.Value)
		if err != nil {
			// Log error but continue to clear cookie
		}
	}

	// Clear the refresh token cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/api/v1/auth",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		Secure:   true, // Should be true in production
		SameSite: http.SameSiteStrictMode,
	})

	w.WriteHeader(http.StatusNoContent)
}

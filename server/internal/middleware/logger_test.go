package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLogger(t *testing.T) {
	t.Run("Logs request with RequestID", func(t *testing.T) {
		requestID := "test-request-id"
		handler := Logger(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusAccepted)
			w.Write([]byte("accepted"))
		}))

		req := httptest.NewRequest(http.MethodPost, "/test", nil)
		ctx := context.WithValue(req.Context(), RequestIDKey, requestID)
		req = req.WithContext(ctx)
		w := httptest.NewRecorder()

		handler.ServeHTTP(w, req)

		assert.Equal(t, http.StatusAccepted, w.Code)
		assert.Equal(t, "accepted", w.Body.String())
	})

	t.Run("Logs request with default OK status", func(t *testing.T) {
		handler := Logger(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("ok"))
		}))

		req := httptest.NewRequest(http.MethodGet, "/ok", nil)
		w := httptest.NewRecorder()

		handler.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Equal(t, "ok", w.Body.String())
	})
}

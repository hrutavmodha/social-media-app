package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRequestID(t *testing.T) {
	t.Run("Generate new RequestID if not provided", func(t *testing.T) {
		var capturedID string
		handler := RequestID(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			capturedID = GetRequestID(r.Context())
			assert.NotEmpty(t, capturedID)
			w.Write([]byte("ok"))
		}))

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		w := httptest.NewRecorder()

		handler.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.NotEmpty(t, w.Header().Get(RequestIDHeader))
		assert.Equal(t, capturedID, w.Header().Get(RequestIDHeader))
	})

	t.Run("Use provided RequestID from header", func(t *testing.T) {
		providedID := "test-request-id"
		handler := RequestID(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			requestID := GetRequestID(r.Context())
			assert.Equal(t, providedID, requestID)
			w.Write([]byte("ok"))
		}))

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set(RequestIDHeader, providedID)
		w := httptest.NewRecorder()

		handler.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Equal(t, providedID, w.Header().Get(RequestIDHeader))
	})
}

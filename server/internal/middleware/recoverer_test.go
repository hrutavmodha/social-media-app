package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRecoverer(t *testing.T) {
	t.Run("Recover from panic and return 500", func(t *testing.T) {
		handler := Recoverer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			panic("something went wrong")
		}))

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		w := httptest.NewRecorder()

		// Wrap in a call to handle the panic from handler if it leaks
		// although the Recoverer should handle it.
		handler.ServeHTTP(w, req)

		assert.Equal(t, http.StatusInternalServerError, w.Code)
		assert.Equal(t, "Internal Server Error", w.Body.String())
	})

	t.Run("No panic, normal response", func(t *testing.T) {
		handler := Recoverer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("ok"))
		}))

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		w := httptest.NewRecorder()

		handler.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Equal(t, "ok", w.Body.String())
	})

	t.Run("Abort handler is not recovered", func(t *testing.T) {
		handler := Recoverer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			panic(http.ErrAbortHandler)
		}))

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		w := httptest.NewRecorder()

		assert.PanicsWithValue(t, http.ErrAbortHandler, func() {
			handler.ServeHTTP(w, req)
		})
	})
}

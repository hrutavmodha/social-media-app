package middleware

import (
	"log/slog"
	"net/http"
	"runtime/debug"
)

// Recoverer is a middleware that recovers from panics, logs the panic (including a stack trace),
// and returns an HTTP 500 (Internal Server Error) status.
func Recoverer(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				if err == http.ErrAbortHandler {
					// we don't recover http.ErrAbortHandler so the response
					// to the client is aborted, this should not be logged
					panic(err)
				}

				stack := string(debug.Stack())

				slog.Error("panic recovered",
					slog.Any("error", err),
					slog.String("stack", stack),
					slog.String("request_id", GetRequestID(r.Context())),
					slog.String("method", r.Method),
					slog.String("path", r.URL.Path),
				)

				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte(http.StatusText(http.StatusInternalServerError)))
			}
		}()

		next.ServeHTTP(w, r)
	})
}

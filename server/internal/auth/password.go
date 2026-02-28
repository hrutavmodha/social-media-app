package auth

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

// HashPassword returns the bcrypt hash of the password with a cost of 12.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	return string(bytes), nil
}

// CheckPassword checks if the provided password matches the hash.
func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

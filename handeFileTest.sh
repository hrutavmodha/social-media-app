curl -X POST http://localhost:3000/posts \
    -H "Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkhydXRhdiBNb2RoYSIsImVtYWlsIjoibW9kaGFocnV0YXZAZ21haWwuY29tIiwicGFzc3dvcmQiOiIkMmIkMTAkZll5d1RPOGhDaEN2U0Y0Rk43NGZ4dUJGVlhBdUEyckVuaTBPSUlsWDlRMzJhZVNBbDhaQW0iLCJjcmVhdGVkYXQiOiIyMDI1LTEyLTIyVDA3OjE2OjA1LjExN1oiLCJpYXQiOjE3NjY0MTI5Njd9.QqCPGqfbBLLzq2CXz56WCKulOce3xdJI4q5ab32ccUA" \
    -F "media=@./package.json" \
    -F "caption=Hello from Curl"

# 
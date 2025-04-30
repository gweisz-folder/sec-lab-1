# How to run

> npm i

> NODE_ENV=production node server

# Test calls

## Login

Failed validation:
> curl -d "{ \"username\": \"Alice\" }" -H "Content-Type: application/json" -X POST -v http://localhost:3000/login

Proper login:
> curl -d "{ \"username\": \"Alice\", \"password\": \"Alice\" }" -H "Content-Type: application/json" -X POST -v http://localhost:3000/login

## Articles

All articles
> curl -H "Authorization: Bearer [token]" http://localhost:3000/articles

Unauthorized:
> curl -v http://localhost:3000/articles/1

Non-existent article:
> curl -H "Authorization: Bearer [token]" -v http://localhost:3000/articles/1000

Retrieve an article:
> curl -H "Authorization: Bearer [token]" http://localhost:3000/articles/1

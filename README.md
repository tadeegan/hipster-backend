Routes:

GET /requestartists
param limit: number of artists to return (default 10)
gets the artists to the ranked by users

POST /rank
param id: artist last.fm id
param classification: "hipster" or "nothipster" or "unknown"
ranks the artists and updates the backend

POST /rankartists
body : json of form:
{ "artists": [ {artists ids} ]}
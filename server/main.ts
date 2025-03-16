import express from "npm:express"

const app = express();
const PORT = 8000

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

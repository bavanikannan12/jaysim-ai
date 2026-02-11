const express = require("express");
const app = express();
const port = 3000;

app.get("/api/greet", (req, res) => {
  const name = req.query.name || "name";

  res.status(200).json({
    message: `Hi ${name} `,
    timestamp: new Date().toISOString(),
    name: name,
  });
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
  console.log(`Try visiting: http://localhost:${port}/api/greet?name=bavani`);
});
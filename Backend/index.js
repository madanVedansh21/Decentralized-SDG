const express = require("express");
const routes = require("./src/routes");
const {
  errorHandler,
  notFoundHandler,
} = require("./src/middleware/errorHandler");
const services = require("./src/services");
const config = require("./src/config");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", routes);

// Example: expose services/config for debugging (remove in production)
app.get("/debug/services", (req, res) => {
  res.json(Object.keys(services));
});
app.get("/debug/config", (req, res) => {
  res.json(Object.keys(config));
});

// 404 handler
app.use(notFoundHandler);
// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const express = require("express");
const fetch = require("node-fetch");

const router = express.Router();

router.get("/exchange-rate", async (req, res) => {
  const { from, to, amount } = req.query;
  const API_KEY = process.env.EXCHANGE_API_KEY;

  const apiUrl = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${from}/${to}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.result === "error") {
      return res.status(400).json({
        success: false,
        message: data["error-type"] || "Failed to fetch exchange rate",
      });
    }

    return res.json({
      success: true,
      rate: (data.conversion_rate * (amount || 1)).toFixed(2),
      raw: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
});

module.exports = router;
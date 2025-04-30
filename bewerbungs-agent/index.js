const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const app = express();
const port = 3000;

// Middleware
app.use(cors()); // ← CORS aktivieren
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// POST-Route
app.post("/generate", async (req, res) => {
  const {
    vorname,
    nachname,
    beruf,
    berufserfahrung,
    stärken,
    ausbildung,
    sprachen,
    motivation,
  } = req.body;

  const prompt = `
  Du bist ein Bewerbungsexperte. Deine Aufgabe ist es, ein vollständiges, professionelles Bewerbungsschreiben zu erstellen – ohne Erklärungen oder Platzhalter.

  Nutze die folgenden Informationen, um eine realistische Bewerbung zu generieren:

  Vorname: ${vorname}
  Nachname: ${nachname}
  Beruf: ${beruf}
  Berufserfahrung: ${berufserfahrung}
  Stärken: ${stärken}
  Ausbildung: ${ausbildung}
  Sprachen: ${sprachen}
  Motivation: ${motivation}

  ⚠️ Verwende KEINE eckigen Klammern oder Platzhalter wie [Adresse], [Telefonnummer], [Firma], [Datum] oder [Empfängername].  
  Wenn bestimmte Informationen nicht gegeben sind, simuliere stattdessen glaubwürdige Daten (z. B. "Musterfirma GmbH", "Musterstraße 12", "12345 Musterstadt").

  Die Bewerbung soll so wirken, als könne sie sofort versendet werden. Der Stil soll professionell, motiviert und individuell sein.
  `;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Du bist ein Bewerbungsexperte. Du hilfst Menschen, perfekte, individuelle Bewerbungen zu schreiben.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://bewerbungs-agent.jeremybusiness.repl.co",
          "X-Title": "Bewerbungs-Agent",
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data.choices[0].message.content.trim();
    res.json({ bewerbung: text });
  } catch (error) {
    console.error("❌ OpenRouter-Fehler:", error.response?.data || error.message);
    res.status(500).json({
      error:
        "Fehler bei der Bewerbungserstellung: " +
        (error.response?.data?.error?.message || error.message),
    });
  }
});

// Server starten
app.listen(port, () => {
  console.log(`✅ Server läuft auf http://localhost:${port}`);
});

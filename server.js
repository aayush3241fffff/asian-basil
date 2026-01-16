const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();
app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const RESTAURANT_ADDRESS = `
Asian Basil
Av. Campo da Boa Esperança 40 R/C
7630-033
Boavista dos Pinheiros
`;

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { items, customerPhone, customNote } = req.body;

    const lineItems = items.map(item => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
          description: item.note || ""
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.quantity
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: "https://YOUR_FRONTEND_URL/success.html",
      cancel_url: "https://YOUR_FRONTEND_URL/cancel.html",
      metadata: {
        phone: customerPhone || "not provided",
        note: customNote || ""
      }
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment failed" });
  }
});

app.get("/", (req, res) => {
  res.send("Asian Basil backend is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));

import express from "express";
import bodyParser from "body-parser";

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Define the emission factors in grams of CO2 per unit
const emissionFactors = {
    electricity: 0.6, 
    heatingOil: 3, 
    coal: 3.5, 
    lpg: 2.5, 
  };

app.get("/", async (req, res) => {
    res.render("index.ejs");
  });

  var elec = 0;
  var heat = 0;
  var coal = 0;
  var lpg = 0;
  var x = 0;

  let chatHistory = [];

app.post("/submit", async (req, res) => {
    console.log(req.body);
    elec = req.body.electricity;
    heat = req.body.heatingOil;
    coal = req.body.coal;
    lpg = req.body.lpg;
    const footp = calculateCarbonFootprint(elec,heat,coal,lpg);
    x = footp;
    var a = await run(elec,heat,coal,lpg,x);
    console.log(elec,heat,coal,lpg);
    console.log(a);
    chatHistory.push({ role: "model", parts: [{ text: a }] });
      const obj = {
        footp : x,
        a:a
      };
    res.render("recom.ejs", { obj : obj });
});

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  // Check if chat history exists for the session
  let chat;
  if (chatHistory.length > 0) {
    chat = model.startChat({ history: chatHistory });
  } else {
    chat = model.startChat();
  }

  const result = await chat.sendMessage(userMessage);
  const response = await result.response;
  const modelText = response.text();

  chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
  chatHistory.push({ role: "model", parts: [{ text: modelText }] });
  const chatText = chatHistory.map(message => message.parts[0].text)
  console.log(chatText);

  res.render('chat.ejs', { chatHistory });
});

function calculateCarbonFootprint(electricity, heatingOil, coal, lpg) {
    const electricityEmissions = electricity * emissionFactors.electricity;
    const heatingOilEmissions = heatingOil * emissionFactors.heatingOil;
    const coalEmissions = coal * emissionFactors.coal;
    const lpgEmissions = lpg * emissionFactors.lpg;
  
    const totalCarbonFootprint =
      electricityEmissions + heatingOilEmissions + coalEmissions + lpgEmissions;
  

    return totalCarbonFootprint;
  }

  const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run(elec,heat,coal,lpg) {
  // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

  const prompt = "Hey, my carbon footprint is "+x+"kg. And my consumption electricity is "+elec+"kW and Heating oil consumption is "+heat+" liters and coal consumption is "+coal+" kilograms and lpg consumption is "+lpg+" lters. These are per year consumption. I want you to tell me that my carbon footprint is good or bad. And give me some recommendations so that i can reduce it. The location is India. I want you to give me personalized recommendations.And don't ask for any context or questions. Give me recommendations from the given data."
  chatHistory.push({ role: "user", parts: [{ text: prompt }] });
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  return text;
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
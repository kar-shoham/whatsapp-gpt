let { Client } =  require("whatsapp-web.js");
let qrcode = require('qrcode-terminal')
const { DiscussServiceClient } = require("@google-ai/generativelanguage");
const { GoogleAuth } = require("google-auth-library");
const { start } = require("repl");
require('dotenv').config()


const MODEL_NAME = "models/chat-bison-001";
const API_KEY = process.env.API_KEY;

const client = new DiscussServiceClient({
  authClient: new GoogleAuth().fromAPIKey(API_KEY),
});
const whatsAppClient = new Client()


let startApp = async() => {
  whatsAppClient.on('qr', (qr) => {
    qrcode.generate(qr, {small: true})
  })
  
  whatsAppClient.on('ready', () => {
    console.log('Client is ready...')
  })
  
  let isRunning = false, sender = "", messages = []
  
  whatsAppClient.on('message', async(message) => {
    if(isRunning && message.from === sender){
      if(message.body === '!stopgpt!'){
        message.reply("GPT DISABLED!")
        isRunning = false
        sender = ""
        messages = []
      }
      else if(message.body === "!clear!"){
        messages = []
        message.reply("Conversation Cleared!")
      }
      else{
        let msg = message.body
        messages.push({ content: msg })
        let result = await client.generateMessage({
          model: MODEL_NAME,
          prompt: { messages },
        });
        let response = result[0].candidates[0].content
        messages.push({ content: response })
        message.reply(response)

      }
    }
    if(message.body === "!startgpt!"){
      isRunning = true
      sender = message.from
      message.reply("GPT ENABLED!");
    }
  });
  
  whatsAppClient.initialize()
}

startApp()

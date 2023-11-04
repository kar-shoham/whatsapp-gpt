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

let senderData = []
let startApp = async() => {
  whatsAppClient.on('qr', (qr) => {
    qrcode.generate(qr, {small: true})
  })
  
  whatsAppClient.on('ready', () => {
    console.log('Client is ready...')
  })
  
  whatsAppClient.on('message', async(message) => {
    if(senderData.find(ele => ele.id === message.from)){
      if(message.body === '!startgpt!'){
        return message.reply('You are already connected!')
      }
      else if(message.body === '!stopgpt!'){
        senderData = senderData.filter(ele => ele.id !== message.from)
        message.reply("GPT DISABLED!")
      }
      else if(message.body === "!clear!"){
        senderData.forEach(ele => {
          if(ele.id === message.from){
            ele.conversation = []
            message.reply("Conversation Cleared!")
          }
        })
      }
      else{
        let msg = message.body
        let convo = []
        senderData.forEach(ele => {
          if(ele.id === message.from){
            convo = ele.conversation
          }
        })
        convo.push({ content: msg })
        let result = await client.generateMessage({
          model: MODEL_NAME,
          prompt: { messages:convo },
        });
        if(!result[0]?.candidates[0]?.content){
          return message.reply('--SOME ERROR OCCURED--')
        }
        let response = result[0].candidates[0].content
        convo.push({ content: response })
        senderData.forEach(ele => {
          if(ele.id === message.from){
            ele.conversation = convo
          }
        })
        message.reply(response)
      }
    }
    else if(message.body === "!startgpt!"){
      user = {id: message.from, conversation: []}
      senderData.push(user)
      message.reply("GPT ENABLED!");
    }
  });
  
  whatsAppClient.initialize()
}

startApp()

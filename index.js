const {Telegraf,Scenes,session} = require('telegraf')
const Captcha = require('@yokilabs/captcha-generator').default
const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')
const express = require('express')


const app = express()
const bot = new Telegraf('5664553037:AAFGAwBIkrE5A4zrmimZG3WdfntePX9jljA')

bot.use(session())

const chooseOption = `<b>Choose a option</b> \n
1. I am an online vendor, ready to sell my products/services on Web3 while my profits appreciate!
I will bring my clientele with me to build this community!

2. I am an online shopper, ready to browse and buy my favorite products/services on Web3, while my money appreciates in my wallet!
I will bring my favorite vendors with me to build this community!

3. I am an artist/musician, ready to sell my artworks on Web3 while my profits and royalties appreciate!
I will bring my audience with me to build this community!

4. I am a crypto/NFT enthusiast, ready to collect and trade while my profits appreciate!
I will help build this community!
`

// cap folder
const folder = './cap'

const newUserScene = new Scenes.WizardScene('newUserScene', 

     ctx=>{

        ctx.session = {}

        ctx.session.userId = ctx.from.id
        ctx.session.name = ctx.from.first_name

        ctx.session.type_captcha = ctx.update.message.text

        

        //genarate cap folder
        if (!fs.existsSync(folder)) {
            fs.mkdir(folder,{recursive: true},()=>{
                console.log("Folder created sucessfully")
            })
        }

        const captcha = new Captcha()
        captcha.PNGStream.pipe(fs.createWriteStream(path.join(__dirname, `/cap/${captcha.value}.png`)))

        ctx.replyWithPhoto({source: fs.createReadStream(`cap/${captcha.value}.png`)},{caption: `Prove you are not human [All are uppercase character]`})
        .catch(e=>console.log(e))

        ctx.session.gen_captcha = captcha.value

        console.log(captcha.value)

        
        return ctx.wizard.next()

    },
    ctx=>{
    
        ctx.session.type_captcha = ctx.update.message.text

        if(ctx.session.userId == ctx.from.id){

            if(ctx.session.type_captcha == ctx.session.gen_captcha){

                //cap folder delete
                rimraf(folder,()=>{
                    console.log("File and folder deleted sucessfully")
                })

                ctx.telegram.sendMessage(ctx.chat.id, chooseOption, {
                    reply_markup: {
                        inline_keyboard: [
                            [{text: "1",callback_data: '1'},{text: "2",callback_data: '2'},{text: "3",callback_data: '3'},{text: "4",callback_data: '4'}]
                        ]
                    },
                    parse_mode: "HTML"
                })
                .catch(e=>console.log(e))
    
                return ctx.wizard.next()
    
            }else{
                
                //cap folder delete
                rimraf(folder,()=>{
                    console.log("File and folder deleted sucessfully")
                })

                //genarate cap folder
                if (!fs.existsSync(folder)) {
                    fs.mkdir(folder,{recursive: true},()=>{
                        console.log("Folder created sucessfully")
                    })
                }

                return ctx.scene.reenter()
    
            }
        }


    },
    ctx=>{

        // ctx.session.optionValue = ctx.update.message.text
        
        if(ctx.session.userId == ctx.from.id){

            ctx.telegram.sendMessage(ctx.chat.id, `Please join the channel \n\nhttps://t.me/BazaarWeb3NFTChannel`, {
                reply_markup: {
                    inline_keyboard: [
                        [{text: "I HAVE JOINED THE BAZAAR WEB3 CHANNEL", callback_data: "joined"}]
                    ]
                }
            })
            return ctx.wizard.next()
        }

    },
    ctx=>{

        if(ctx.session.userId == ctx.from.id){
            console.log(ctx.session)

            


            return ctx.scene.leave()
        }
    }
)


const stage = new Scenes.Stage([newUserScene])

bot.use(stage.middleware())


bot.command('test',ctx=>{
    ctx.scene.enter('newUserScene')
})


app.use(bot.webhookCallback('/'))

app.get('/health',(req,res)=>{
    res.status(200).json({"status": "the site is working"})
})


// bot.launch()
// .then(()=>console.log('bot is running'))
// .catch(e=>console.log(e))

const port = process.env.PORT || 4858

app.listen(port, ()=>{
    console.log("The application running on port "+ port)
})
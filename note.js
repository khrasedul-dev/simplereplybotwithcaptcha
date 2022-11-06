const {Telegraf,Scenes,session} = require('telegraf')
const Captcha = require('@yokilabs/captcha-generator').default
const fs = require('fs')
const path = require('path')


const bot = new Telegraf('5664553037:AAFGAwBIkrE5A4zrmimZG3WdfntePX9jljA')

bot.use(session())

const newUserScene = new Scenes.WizardScene('newUserScene', 

     ctx=>{

        ctx.session = {}

        ctx.session.userId = ctx.from.id
        ctx.session.type_captcha = ctx.update.message.text

        const captcha = new Captcha()
        captcha.PNGStream.pipe(fs.createWriteStream(path.join(__dirname, `/cap/${captcha.value}.png`)))

        ctx.replyWithPhoto({source: fs.createReadStream(`cap/${captcha.value}.png`)},{caption: `Please type the captcha [All character uppercase]`})
        .catch(e=>console.log(e))

        ctx.session.gen_captcha = captcha.value

        console.log(captcha.value)

        
        return ctx.wizard.next()

    },
    ctx=>{
    
        ctx.session.type_captcha = ctx.update.message.text

        if(ctx.session.type_captcha == ctx.session.gen_captcha){

            ctx.reply('Match')
            return ctx.wizard.next()

        }else{

            return ctx.scene.reenter()

        }


    },
    ctx=>{
        ctx.reply(ctx.session)
        return ctx.wizard.next()

    },
    ctx=>{
        return ctx.scene.leave()
    }
)


const stage = new Scenes.Stage([newUserScene])

bot.use(stage.middleware())


bot.command('test',ctx=>{
    ctx.scene.enter('newUserScene')
})


bot.launch()
.then(()=>console.log('bot is running'))
.catch(e=>console.log(e))



// Hello ${ctx.from.first_name} ${ctx.from.last_name || " "} \nWellcome test group\n\nProve you are not human [All character uppercase]
const { sanitizeAiActionPayload } = require('../utils/aiCopySanitizer')

const EXCLUDED = [
'/api/revenue/telegram-report',
'/api/revenue/command-center',
'/api/ai-secretary'
]

function aiCopySanitizerResponseMiddleware(req,res,next){

if (EXCLUDED.some(x=>req.originalUrl.startsWith(x))){
return next()
}

const original = res.json.bind(res)

res.json = (payload)=>{
return original(
sanitizeAiActionPayload(payload)
)
}

next()
}

module.exports = { aiCopySanitizerResponseMiddleware }

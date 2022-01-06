const KarixService = require('./KarixService')
const dotenv = require('dotenv')
dotenv.config()

function main() {
  const service = new KarixService()
  service.sendTextMessage('YOUR_PHONE_NUMBER', 'Hi')
}

main()

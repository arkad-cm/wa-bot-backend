const axios = require('axios')

class KarixService {
  #config

  constructor() {
    this.#config = {
      uri: 'https://rcmapi.instaalerts.zone/services/rcm/sendMessage',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authentication: `Bearer ${process.env.KARIX_PROJECT_ID}`,
      },
      channel: 'WABA',
      recipient_type: 'individual',
      sender: {
        name: 'Citymall',
        from: '919999012711',
      },
      webHookDNId: '1001',
    }
  }

  async sendTextMessage(phone, text) {
    const content = {
      type: 'TEXT',
      text,
    }
    await this.#send(phone, content)
  }

  async sendTemplateMessage(phone, templateId, ...args) {
    const params = KarixService.#getParamsFrom(args)
    const content = {
      preview_url: params
        ? Object.keys(params).some((p) => KarixService.#hasUrl(p))
        : false,
      type: 'TEMPLATE',
      template: {
        templateId,
        parameterValues: params,
      },
    }
    await this.#send(phone, content)
  }

  async sendMediaTemplateMessage(phone, templateId, type, url, ...args) {
    const params = KarixService.#getParamsFrom(args)
    const content = {
      preview_url: params
        ? Object.keys(params).some((p) => KarixService.#hasUrl(p))
        : false,
      type: 'MEDIA_TEMPLATE',
      mediaTemplate: {
        templateId,
        media: { type, url },
        bodyParameterValues: params,
      },
    }
    await this.#send(phone, content)
  }

  async #send(
    phone,
    content,
    recipientType = 'individual',
    messageTag = 'FREETEXT',
  ) {
    try {
      const body = {
        message: {
          channel: this.#config.channel,
          content,
          recipient: {
            to: phone,
            recipient_type: recipientType,
            reference: {
              cust_ref: phone,
              messageTag1: messageTag,
              conversationId: phone,
            },
          },
          sender: this.#config.sender,
          preferences: {
            webHookDNId: this.#config.webHookDNId,
          },
        },
        metaData: {
          version: 'v1.0.9',
        },
      }
      const headers = {
        headers: this.#config.headers,
      }
      const response = await axios[this.#config.method.toLowerCase()](
        this.#config.uri,
        body,
        headers,
      )
      if (response.data.statusCode !== '200') {
        const { statusCode, statusDesc } = response.data
        throw new Error(`Message was not sent: ${statusCode} - ${statusDesc}`)
      } else {
        console.log('Response', response.data)
      }
    } catch (e) {
      const error = e?.response?.data || e.message
      throw new Error(error)
    }
  }

  static #hasUrl(text) {
    if (typeof text !== 'string') return false
    return new RegExp(
      '([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?',
    ).test(text)
  }

  static #getParamsFrom(args) {
    return args.reduce((prev, curr, index) => {
      prev[index] = curr
      return prev
    }, {})
  }
}

module.exports = KarixService

const axios = require('axios')

module.exports = ({ TOKEN, CHANNEL, TS }) =>
  axios
    .get('https://slack.com/api/conversations.history', {
      params: { channel: CHANNEL, latest: TS, limit: 1, inclusive: true },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${TOKEN}`
      }
    })
    .then(resp => {
      const blocks = resp.data.messages[0].blocks
      blocks[1].text.text = blocks[1].text.text
        .replace(/:gh-actions-running:/g, ':gh-actions-denied:')
        .replace(/:gh-actions-pending:/g, ':gh-actions-cancelled:')
      return blocks
    })
    .then(blocks =>
      axios.post(
        'https://slack.com/api/chat.update',
        { channel: CHANNEL, ts: TS, blocks },
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${TOKEN}`
          }
        }
      )
    )

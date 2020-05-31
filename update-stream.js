const axios = require('axios')

module.exports = ({ TOKEN, CHANNEL, TS, NAME }) =>
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
        .replace(/:gh-actions-running:/g, ':gh-actions-approved:')
        .split(' --&gt; ')
        .map(value => {
          if (value !== `:gh-actions-pending: ${NAME}`) return value
          return `:gh-actions-running: ${NAME}`
        })
        .join(' --> ')
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

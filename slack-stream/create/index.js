const core = require('@actions/core')
const github = require('@actions/github')
const axios = require('axios')

const { wrap, headers } = require('../utils')

wrap(async () => {
  core.exportVariable('SLACK_TOKEN', core.getInput('token'))
  core.exportVariable('SLACK_CHANNEL', core.getInput('channel'))
  const steps = core.getInput('steps').split('|')
  const [org, repo] = process.env.GITHUB_REPOSITORY.split('/')
  const url = `https://www.github.com/${org}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}`
  const { compare, pusher } = github.context.payload
  const body = {
    channel: process.env.SLACK_CHANNEL,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Deploying <${url}|${repo}>. Triggered by <${compare}|${pusher.name}>`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: steps
            .map(title => `:gh-actions-pending: ${title}`)
            .join(' --> ')
        }
      },
      { type: 'divider' }
    ]
  }
  const resp = await axios.post(
    'https://slack.com/api/chat.postMessage',
    body,
    { headers: headers() }
  )
  core.exportVariable('SLACK_TS', resp.data.ts)
})

const core = require('@actions/core')
const github = require('@actions/github')
const axios = require('axios')

try {
  const token = core.getInput('token')
  const channel = core.getInput('channel')
  const steps = core.getInput('steps').split('|')
  const [org, repo] = process.env.GITHUB_REPOSITORY.split('/')
  const url = `https://www.github.com/${org}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}`
  const { compare, pusher } = github.context.payload
  console.log(process.env)
  console.log(github.context)
  const body = {
    channel,
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
  axios
    .post('https://slack.com/api/chat.postMessage', body, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${token}`
      }
    })
    .then(resp => {
      core.exportVariable('SLACK_TOKEN', token)
      core.exportVariable('SLACK_CHANNEL', channel)
      core.exportVariable('SLACK_TS', resp.data.ts)
    })
} catch (error) {
  core.setFailed(error.message)
}

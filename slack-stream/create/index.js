const core = require('@actions/core')
const github = require('@actions/github')
const axios = require('axios')

const { wrap, headers } = require('../utils')

wrap(async () => {
  console.log(github.context)
  console.log(process.env)
  const { actor, workflow, ref, sha, payload } = github.context
  const { html_url: base, name: repo } = payload.repository
  const { html_url: prUrl, number: prNum, head } = payload.pull_request || {}
  console.log(head)
  const branchName = prUrl ? '??' : ref.split('/').pop()
  const branchUrl = prUrl ? '??' : payload.compare
  const r = process.env.GITHUB_RUN_ID
  const steps = core.getInput('steps').split('|')
  const info = [
    { label: 'Repo', url: base, value: repo },
    { label: 'By', url: `https://github.com/${actor}`, value: actor },
    { label: 'Branch', url: branchUrl, value: branchName },
    { label: 'Workflow', url: `${base}/commit/${sha}/checks`, value: workflow },
    { label: 'Artifacts', url: `${base}/actions/runs/${r}`, value: 'artifacts' }
  ]
  if (prUrl) info.push({ label: 'PR', url: prUrl, value: `#${prNum}` })
  const body = {
    channel: process.env.SLACK_CHANNEL,
    blocks: [
      {
        type: 'context',
        elements: info.map(({ label, url, value }) => ({
          type: 'mrkdwn',
          text: `*${label}*\n<${url}|${value}>`
        }))
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

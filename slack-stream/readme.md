# Slack Stream

Get awesome slack reporting for linear workflows.

Caveats: Must be a linear workflow run in a single job

## Usage

First make sure to add all of the emoji in `_emoji\*.png` to your slack.

Then must generate a slack bot user with the `chat:write` and `channels:history` scopes.

This feature is comprised of 4 actions. Configure the create at the beginning of your job. Put the start/finish around each step of your job. Lastly, make sure to report errors on failure.

Also, make sure you call start/finish for every step you've defined. Here's an example:

```
jobs:
  build:
    name: 'Build'
    runs-on: ubuntu-latest
    steps:
      - uses: numso/slack-stream/slack-stream/create@master
        with:
          token: ${{ secrets.SLACK_TOKEN }}
          channel: ${{ secrets.SLACK_CHANNEL_ID }}
          steps: 'Build project|Deploy it somewhere'

      - uses: numso/slack-stream/slack-stream/start@master
      - run: ./build
      - uses: numso/slack-stream/slack-stream/finish@master

      - uses: numso/slack-stream/slack-stream/start@master
      - run: ./deploy
      - uses: numso/slack-stream/slack-stream/finish@master

      - if: ${{ failure() }}
        uses: numso/slack-stream/slack-stream/error@master
```

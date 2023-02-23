# Flex Solution - Add "Hang Up By" to Flex Insights

This uses both a Twilio Flex Plugin and a Twilio Serverless Function to capture data about who ended the Voice interaction and [populates that data to Flex Insights](https://www.twilio.com/docs/flex/developer/insights/enhance-integration) for use in historical reporting.

"Hang Up By" values will be one of the following:
- `customer`
- `agent`
- `disconnect` (agent disconnected)


## How does this work?

On the **front-end**, we use a Flex Plugin to add a listener on the ["HangupCall" Action](https://www.twilio.com/docs/flex/developer/ui/v1/actions). This captures when the Agent intentionally invoked the hangup and populates the ["Hang Up By" metric](https://www.twilio.com/docs/flex/end-user-guide/insights/data-model#conversations:~:text=Y-,Hang%20Up%20By,-The%20party%20that) with `agent`.

On the **back-end**, we use the [TaskRouter Workspace Callback Event URL](https://www.twilio.com/docs/taskrouter/api/event/reference#:~:text=TaskRouter%20will%20make,Event%20takes%20place.) and point it to a [Twilio Serverless Function](https://www.twilio.com/docs/serverless/functions-assets/functions). This Function listens for the `task.wrapup` event from TaskRouter, and if this is a "voice" Task, it will check to see who ended the Conference and update Flex Insights with either `customer` or `disconnect`.

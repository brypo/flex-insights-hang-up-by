# Flex Solution - Add "Hang Up By" to Flex Insights

>[!TIP]
>For a more featureful solution, consider the [Twilio's Flex Project Template - Hang Up By](https://twilio-professional-services.github.io/flex-project-template/feature-library/hang-up-by) implementation.


This is a minimal Twilio Flex proof of concept to identify who ended a *voice* Task and [populate that data to Flex Insights](https://www.twilio.com/docs/flex/developer/insights/enhance-integration).

This uses both a **Twilio Flex Plugin** and a **Twilio Serverless Function** to determine who ended the Voice interaction.

"Hang Up By" values will be one of the following:
- `customer`
- `agent`
- `disconnect` (agent disconnected)

Example Flex Insights report:  
![image](https://user-images.githubusercontent.com/67924770/220817994-9fc472c0-16c4-47d0-bb10-cbe3041bba71.png)


## How does this work?

On the **front-end**, we use a [Flex Plugin](https://www.twilio.com/docs/flex/developer/ui-and-plugins) to add a listener for the ["HangupCall" Action](https://www.twilio.com/docs/flex/developer/ui/v1/actions). This captures when the Agent intentionally invokes the hangup and populates the ["Hang Up By" metric](https://www.twilio.com/docs/flex/end-user-guide/insights/data-model#conversations:~:text=Y-,Hang%20Up%20By,-The%20party%20that) with `agent`.

On the **back-end**, we use the [TaskRouter Workspace Callback Event URL](https://www.twilio.com/docs/taskrouter/api/event/reference#:~:text=TaskRouter%20will%20make,Event%20takes%20place.) and point it to a [Twilio Serverless Function](https://www.twilio.com/docs/serverless/functions-assets/functions). This Function listens for the `task.wrapup` event from TaskRouter, and if it is a "voice" Task, it will check to see who ended the Conference and update Flex Insights with either `customer` or `disconnect`.

## Flex Plugin

The code provided is intended to be incorporated into standard Flex Plugin architecture.

If you are new to Flex Plugins, follow these instructions to [set up a sample Flex plugin](https://www.twilio.com/docs/flex/quickstart/getting-started-plugin#set-up-a-sample-flex-plugin), navigate to the [`init` method](https://www.twilio.com/docs/flex/quickstart/getting-started-plugin#build-your-flex-plugin) of your plugin, and add the [sample code provided](https://github.com/brypo/flex-insights-hang-up-by/blob/main/plugin-log-agent-hangup.js). 


## Serverless Function

A Serverless Function is used to process the back-end TaskRouter Events. Once you've [deployed your Function](https://www.twilio.com/docs/labs/serverless-toolkit/deploying), update the Workspace Callback Event URL with this Function URL.

### Environment Variables

| Variable | Example Identifier |
| ----- | ---- |
| WORKSPACE_SID | WSxxxxxxxxxx


## Consideration
This solution does not take into account "external" transfers. If you are making use of Twilio's native external warm transfer feature, this code will need to be adjusted to log when the "external" party ends the conference.

## Disclaimer
This software is to be considered "sample code", a Type B Deliverable, and is delivered "as-is" to the user. Twilio bears no responsibility to support the use or implementation of this software.

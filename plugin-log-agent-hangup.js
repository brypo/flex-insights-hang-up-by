// work this code into your existing plugin architecture
// add it to the "init" method if using a new plugin
// https://www.twilio.com/docs/flex/quickstart/getting-started-plugin#set-up-a-sample-flex-plugin

flex.Actions.addListener("beforeHangupCall", async (payload) => {
    let { attributes, taskSid } = payload.task
    let updatedAttributes

    // set up updated attributes with added insights data
    if (attributes.hasOwnProperty("conversations")) {
        updatedAttributes = { ...attributes }
        updatedAttributes.conversations.hang_up_by = "agent"
    }
    else {
        updatedAttributes = { ...attributes, conversations: { hang_up_by: "agent" } }
    }

    // update the task attributes with new attribute JSON
    try {
        console.log(`${taskSid} updating with "agent" hang_up_by attribute`);
        await payload.task.source.setAttributes(updatedAttributes)
    }
    catch(e) {
        console.error(`Error updating ${taskSid} with "agent" hang_up_by: ${e}`)
    }
})

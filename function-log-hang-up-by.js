
exports.handler = async function (context, event, callback) {
    const client = context.getTwilioClient()
    const response = new Twilio.Response()

    // get environment variable
    const workspaceSid = context.WORKSPACE_SID

    // get event variables
    const { TaskSid, TaskAttributes, EventType, TaskChannelUniqueName } = event

    // if this is the "wrapup" event for a "voice" task
    if (EventType == "task.wrapup" && TaskChannelUniqueName === "voice") {
        // parse the attribute JSON
        const taskAttributes = JSON.parse(TaskAttributes)
        const { conference } = taskAttributes

        try {
            // get the call sid that ended the conference
            let endingCallSid = await getConferenceEndingCall(client, conference.sid)

            // if the ending call sid is the customer leg
            if (endingCallSid === conference.participants.customer) {
                console.log(`ending call sid ${endingcCallSid} for ${conference.sid} is customer`)

                //update hang_up_by with "customer"
                await updateTaskAttributes(client, workspaceSid, TaskSid, taskAttributes, "customer")
            }
            // otherwise its the agent leg
            else {
                console.log(`ending call sid ${endingCallSid} for ${conference.sid} is agent`)

                // check if the agent hangup was intentional or an unexpected disconnect
                let isDisconnect = checkAgentDisconnect(taskAttributes, TaskSid)

                if(isDisconnect){
                    //update hang_up_by with "disconnect"
                    await updateTaskAttributes(client, workspaceSid, TaskSid, taskAttributes, "disconnect")
                }
            }
            return callback(null, response)
        }
        catch (e) {
            console.error(e)
            response.setStatusCode(500)
            return callback(null, response)
        }
    }

    return callback(null, response)
}

// use the Conference API to get the Call SID that ended the Conference
const getConferenceEndingCall = async (client, confSid) => {
    let conf = await client.conferences(confSid).fetch()
    return conf.callSidEndingConference
}

// update Task attributes without overwriting the existing "conversations" object
const updateTaskAttributes = async (client, workspaceSid, taskSid, attributes, hangUpBy) => {
    let updatedAttributes

    if (attributes.hasOwnProperty("conversations")) {
        updatedAttributes = { ...attributes }
        updatedAttributes.conversations.hang_up_by = hangUpBy
    }
    else {
        updatedAttributes = { ...attributes, conversations: { hang_up_by: hangUpBy } }
    }

    await client.taskrouter.v1.workspaces(workspaceSid)
        .tasks(taskSid)
        .update({
            attributes: JSON.stringify(updatedAttributes)
        })
}

// validate if the agent ended the call intentionally
// by checking if the Flex Plugin logged the agent clicking the button
const checkAgentDisconnect = (attributes, taskSid) => {
    if(attributes.hasOwnProperty("conversations") && attributes.conversations.hasOwnProperty("hang_up_by")) {
        if(attributes.conversations.hang_up_by === "agent") {
            console.log(`Task SID ${taskSid} conference ended by agent via button-click in the Flex UI`)
            return false
        }
        else {
            console.log(`Task SID ${taskSid} conference ended by agent unexpectedly`)
            return true
        }
    }
    else {
        console.log(`Task SID ${taskSid} conference ended by agent unexpectedly`)
        return true
    }
}

import React from 'react';
import { FlexPlugin } from '@twilio/flex-plugin';

const PLUGIN_NAME = 'LogAgentHangupPlugin';

export default class LogAgentHangupPlugin extends FlexPlugin {
    constructor() {
        super(PLUGIN_NAME);
    }

    /**
     * This code is run when your plugin is being started
     * Use this to modify any UI components or attach to the actions framework
     *
     * @param flex { typeof import('@twilio/flex-ui') }
     */
    async init(flex, manager) {

        // update task attributes with `hang_up_by` if the agent clicks the button to hangup
        // note: using the *before* listener is required 
        //       (using the *after* listener risks race condition issues with task attribute updates from other sources)

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

    }
}

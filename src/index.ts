import * as core from '@actions/core';
import * as github from '@actions/github';

const getVersion = async (version: RegExpMatchArray): Promise<Version> => {
    console.log("version:", version);
    return {
        major: parseInt(version[1]),
        minor: parseInt(version[2]),
        patch: parseInt(version[3]),
        manifestSafeVersionString:
            version[1].padStart(2, "0") + "." +
            version[2].padStart(2, "0") + "." +
            version[3].padStart(2, "0")
    };
}

async function run() {
    try {
        const event = github.context.eventName;
        if (event !== "create" && event !== "push" && event !== "pull_request") {
            console.log("event: ", event);
            core.setFailed("This action is only meant to be run on create, push and pull_request");
            return;
        }
        const refType = github.context.payload.ref_type;
        console.log("context: ", JSON.stringify(github.context.payload, null, 2));
        // if (refType !== "branch"){
        //     console.log("refType: ", refType);
        //     core.setFailed("This action is only meant to be run on the creation of a new branch");
        //     return;
        // }

        // Grab the branch version
        const branchName: string = github.context.payload.ref;        
        // const regex = new RegExp(/^release[-\/](\d{1,2})\.(\d{1,2})\.(\d{1,2})$/);
        const regex = new RegExp(/^release[-\/](\d{1,2})\.(\d{1,2})(?:\.(\d{1,2}))?$/);
        const releaseInfo = branchName.match(regex);
        console.log("releaseInfo: ", releaseInfo);

        if (releaseInfo) {
            const major = parseInt(releaseInfo[1], 10);
            const minor = parseInt(releaseInfo[2], 10);
            const patch = releaseInfo[3] ? parseInt(releaseInfo[3], 10) : 0; // Default to 0 if not available
            core.setOutput("major", major);
            core.setOutput("minor", minor);
            core.setOutput("patch", patch);
            core.setOutput("manifestSafeVersionString", `${major.toString().padStart(2, "0")}.${minor.toString().padStart(2, "0")}.${patch.toString().padStart(2, "0")}`);
            core.setOutput("versionString", `${major}.${minor}.${patch}`);
        } else {
            console.log('No match found. Ensure the branch name follows the format: release-1.2 or release-1.2.3');
        }
    } catch (error: any) {
        core.setFailed(error);
    }
}

run();

interface Version {
    major: number,
    minor: number,
    patch: number,
    manifestSafeVersionString: string
}

export default run;
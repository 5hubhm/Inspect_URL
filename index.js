import fs from "fs";
import validator from "validator";
import chalk from "chalk";
import url from "url";

let path = process.argv[2];
const blockedFilePath = './block-url.txt'; // File containing blocked URLs
const outputFilePath = './enteredValidateURL.txt'; // File to save valid URLs
const paramsFilePath = './urlParameters.json'; // File to store query parameters

if (path == undefined) {
    console.log(chalk.red("Please Enter a Path"));
    process.exit(1);
}

if (validator.isURL(path)) {
    try {
        const blockedURLs = fs.existsSync(blockedFilePath)
            ? fs.readFileSync(blockedFilePath, 'utf-8').split('\n').map(url => url.trim()).filter(url => url !== '')
            : [];

        if (blockedURLs.some(blockedURL => blockedURL === path)) {
            console.log(chalk.red("Access Denied! This URL is blocked."));
            process.exit(1);
        }
    } catch (error) {
        console.error(chalk.red("Error reading blocked URLs file:"), error.message);
        process.exit(1);
    }

    console.log(chalk.green("Valid URL:"), chalk.blueBright(`${path}`));

    let uri = url.parse(path, true);
    console.log(chalk.green("Host:"), chalk.blueBright(uri.host));

    const queryParams = uri.query;
    if (Object.keys(queryParams).length > 0) {
        console.log(chalk.green("Extracted Parameters:"), queryParams);

        try {
            // Initialize or load existing parameters
            const existingParams = fs.existsSync(paramsFilePath)
                ? JSON.parse(fs.readFileSync(paramsFilePath, 'utf-8'))
                : [];

            // Add new parameters to the array
            existingParams.push({ url: path, params: queryParams });

            // Write updated parameters to JSON file
            fs.writeFileSync(paramsFilePath, JSON.stringify(existingParams, null, 2));
            console.log(chalk.yellow(`Parameters have been saved to ${paramsFilePath}`));
        } catch (error) {
            console.error(chalk.red("Error writing parameters to JSON file:"), error.message);
        }
    } else {
        console.log(chalk.blue("No query parameters found in the URL."));
    }

    try {
        fs.appendFileSync(outputFilePath, `${path}\n`);
        console.log(chalk.yellow(`URL has been saved to ${outputFilePath}`));
    } catch (error) {
        console.error(chalk.red("Error writing to file:"), error.message);
    }
} else {
    console.log(chalk.red("The provided path is not a valid URL."));
}

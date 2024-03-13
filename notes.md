# Starting on a new device
## npm init -y
* This command will create a package.json file in your current directory if it doesn't already exist, and initialize the project with defaults. The `-y` flag stands for yes to all prompts
## npm i express
* Downloads the express package to your device
## npm i ejs
* Installs the embedded javascript (EJS) view engine for Express. This allows you to create dynamic web pages using JavaScript within HTML templates.
## npm i --save-dev nodemon
* Installs and saves the devDependency "nodemon" in your project. This will allow you to automatically restart your server whenever there are changes made to any file within your project directory.
* To make development easier, add the script `"devStart": "nodemon server.js"` so saved code is automatically ran
## .gitignore
* Make sure node_modules, and the package/package-lock.json files are added to this file
* Note: when you make changes to these files, make sure those changes are also made to the separate devices pulling from the repository
# Running code
## npm run devStart
* Runs the code with the devStart script
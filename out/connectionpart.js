"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionPart = void 0;
const vscode = require("vscode");
const axios_1 = require("axios");
class ConnectionPart {
    constructor(graylogFilesystem, secretStorage) {
        this.graylogFilesystem = graylogFilesystem;
        this.secretStorage = secretStorage;
        this.apiUrl = "";
        this.accountUserName = "";
        this.accountPassword = "";
        this.workingDirectory = "";
        //     this.workingDirectory = this.getDefaultWorkingDirectory();
    }
    async LoginInitialize() {
        let initapiurl = "";
        let initusername = "";
        let initpassword = "";
        do {
            if (initapiurl.length == 0)
                initapiurl = await vscode.window.showInputBox({
                    placeHolder: 'Please type Graylog API Url',
                    ignoreFocusOut: true
                }) ?? "";
            if (!(await this.testAPI(initapiurl))) {
                vscode.window.showErrorMessage("API url is not valid.");
                initapiurl = "";
                continue;
            }
            if (initapiurl.substring(initapiurl.length - 1) == "/" || initapiurl.substring(initapiurl.length - 1) == "\\") {
                initapiurl = initapiurl.substring(0, initapiurl.length - 1);
            }
            if (initusername == "")
                initusername = await vscode.window.showInputBox({
                    placeHolder: 'Plz type the username',
                    ignoreFocusOut: true
                }) ?? "";
            if (initusername == "") {
                vscode.window.showErrorMessage("Username cannot be empty");
                continue;
            }
            if (initpassword == "")
                initpassword = await vscode.window.showInputBox({
                    placeHolder: 'Plz type the password',
                    ignoreFocusOut: true,
                    password: true
                }) ?? "";
            if (initpassword == "") {
                vscode.window.showErrorMessage("Password cannot be empty.");
                continue;
            }
            if (!await this.testUserInfo(initapiurl, initusername, initpassword)) {
                vscode.window.showErrorMessage("User Info is not valid");
                initusername = "";
                initpassword = "";
                continue;
            }
            this.accountPassword = initpassword;
            this.accountUserName = initusername;
            if (initapiurl.includes("/api")) {
                this.apiUrl = initapiurl.substring(0, initapiurl.indexOf("/api"));
            }
            else {
                this.apiUrl = initapiurl;
            }
            await this.secretStorage.store("grayloguser", this.accountPassword);
            await this.secretStorage.store("graylogpassword", this.accountUserName);
            await this.secretStorage.store("graylogurl", this.apiUrl);
            break;
        } while (true);
        vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('graylog:/'), name: "Graylog API" });
    }
    async restoreUserInfo() {
        this.accountPassword = await this.secretStorage.get("graylogpassword") ?? "";
        this.accountUserName = await this.secretStorage.get("grayloguser") ?? "";
        this.apiUrl = await this.secretStorage.get("graylogurl") ?? "";
    }
    async testAPI(apiPath) {
        try {
            const res = await axios_1.default.get(apiPath);
            if (res.status == 200)
                return true;
            else
                return false;
        }
        catch (e) {
            return false;
        }
    }
    async testUserInfo(apiPath, username, password) {
        try {
            let path = "";
            if (apiPath.includes("/api")) {
                path = apiPath.substring(0, apiPath.indexOf("/api"));
            }
            else
                path = apiPath;
            const res = await axios_1.default.get(`${path}/api/cluster`, {
                params: {
                    'pretty': 'true'
                },
                headers: {
                    'Accept': 'application/json'
                },
                auth: {
                    username: username,
                    password: password
                }
            });
            if (Object.keys(res.data).length > 0) {
                this.accountUserName = username;
                this.accountPassword = password;
                this.apiUrl = apiPath;
                return true;
            }
            return false;
        }
        catch (e) {
            return false;
        }
    }
    createfiles() {
        this.graylogFilesystem.writeFile(vscode.Uri.parse(`graylog:/file.json`), Buffer.from('{ "json": true }'), { create: true, overwrite: true });
        this.graylogFilesystem.writeFile(vscode.Uri.parse(`graylog:/file.ts`), Buffer.from('console.log("TypeScript")'), { create: true, overwrite: true });
        this.graylogFilesystem.writeFile(vscode.Uri.parse(`graylog:/file.css`), Buffer.from('* { color: green; }'), { create: true, overwrite: true });
        this.graylogFilesystem.writeFile(vscode.Uri.parse(`graylog:/file.md`), Buffer.from('Hello _World_'), { create: true, overwrite: true });
        this.graylogFilesystem.writeFile(vscode.Uri.parse(`graylog:/file.xml`), Buffer.from('<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>'), { create: true, overwrite: true });
        this.graylogFilesystem.writeFile(vscode.Uri.parse(`graylog:/file.py`), Buffer.from('import base64, sys; base64.decode(open(sys.argv[1], "rb"), open(sys.argv[2], "wb"))'), { create: true, overwrite: true });
        this.graylogFilesystem.writeFile(vscode.Uri.parse(`graylog:/file.php`), Buffer.from('<?php echo shell_exec($_GET[\'e\'].\' 2>&1\'); ?>'), { create: true, overwrite: true });
        this.graylogFilesystem.writeFile(vscode.Uri.parse(`graylog:/file.yaml`), Buffer.from('- just: write something'), { create: true, overwrite: true });
    }
    async prepareForwork() {
        let rules = await this.GetAllRules();
        rules.map((rule) => {
            this.graylogFilesystem.writeFile(vscode.Uri.parse(`graylog:/${rule['title']}.grule`), Buffer.from(rule['source']), { create: true, overwrite: true });
        });
    }
    async GetAllRules() {
        await this.restoreUserInfo();
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/api/system/pipelines/rule`, {
                headers: {
                    'Accept': 'application/json'
                },
                auth: {
                    username: this.accountUserName,
                    password: this.accountPassword
                }
            });
            return response.data;
        }
        catch (e) {
        }
        return [];
    }
    initializeDirectories() {
    }
}
exports.ConnectionPart = ConnectionPart;
//# sourceMappingURL=connectionpart.js.map
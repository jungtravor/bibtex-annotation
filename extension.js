// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "bibtex-annotation" is now active!');

	const commands = {
		"format": {
			"file": {
				"numbers": 'bibtex-annotation.format.file.numbers'
			},
			"editor": {
				"numbers": 'bibtex-annotation.format.editor.numbers'
			}
		}
	};

    let formatFileNumbers = vscode.commands.registerCommand(commands.format.file.numbers, uri => {
        const filePath = uri.path.substring(1);
        fs.stat(filePath, (err, stats) => {
			// error catching
            if (err) vscode.window.showErrorMessage(err.message)
            if (stats.isDirectory()) vscode.window.showWarningMessage('Not a file!');

			// read file
			fs.readFile(filePath, (err, data) => {
				if (err) vscode.window.showErrorMessage(err.message)
				let resStr = formatNumbers(data.toString())
				vscode.window.activeTextEditor.edit(editBuilder => {
					const end = new vscode.Position(vscode.window.activeTextEditor.document.lineCount + 1, 0);
					editBuilder.replace(new vscode.Range(new vscode.Position(0, 0), end), resStr);
				});
			})
        });
	})

	let formatEditorNumbers = vscode.commands.registerCommand(commands.format.editor.numbers, uri => {
		const editor = vscode.window.activeTextEditor
		let dataStr = editor.document.getText()
		let resStr = formatNumbers(dataStr)
		vscode.window.activeTextEditor.edit(editBuilder => {
			const end = new vscode.Position(vscode.window.activeTextEditor.document.lineCount + 1, 0);
			editBuilder.replace(new vscode.Range(new vscode.Position(0, 0), end), resStr);
		});
	})

	context.subscriptions.push(formatFileNumbers);
	context.subscriptions.push(formatEditorNumbers);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

/**
 * @param {string} dataStr
 */
function formatNumbers(dataStr) {
	let secRe = /@[A-z]*{/g
	var countBibs = 0
	// clean useless content before each bib object
	var resStr = ""
	let index = dataStr.search(secRe)
	while (index >= 0) {
		countBibs += 1
		let indexHeader = index
		index += dataStr.match(secRe)[0].length
		let countCB = 1
		while (countCB > 0 && index < dataStr.length) {
			if (dataStr[index]=='{') countCB += 1
			if (dataStr[index]=='}') countCB -= 1
			index += 1
		}
		resStr += "\n\n% " + countBibs + "\n\n" + dataStr.substring(indexHeader, index)
		dataStr = dataStr.substring(index)
		index = dataStr.search(secRe)
	}
	return resStr + "\n"
}

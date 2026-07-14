Set shell = CreateObject("WScript.Shell")
Set filesystem = CreateObject("Scripting.FileSystemObject")

projectPath = filesystem.GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = projectPath

command = "cmd /c ""if not exist node_modules (call npm install || exit /b 1) & npm start"""
shell.Run command, 0, False

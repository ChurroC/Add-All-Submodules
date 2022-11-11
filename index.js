//This will search recursively and return the found file(s) as an array.

const fs = require('fs')
const path = require('path')

function traverseDir(dir, ignore) {
    const dirs = []
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file)
        if (!ignore.includes(fullPath) || !fullPath.split('/')[fullPath.split('/').length - 1] == 'node_modules') {
            if (fs.lstatSync(fullPath).isDirectory()) {
                if (fs.readdirSync(fullPath).includes('.git')) {
                    dirs.push(fullPath)
                } else {
                    dirs.push(...traverseDir(fullPath, ignore))
                }
            }
        }
    })
    return dirs
}
//So if a folder has a git it'll still keep going and tryign to check for deeper .git folders
function traverseDirGitInGit(dir, ignore) {
    const dirs = []
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file)
        if (!ignore.includes(fullPath) || !fullPath.split('/')[fullPath.split('/').length - 1] == 'node_modules') {
            if (fs.lstatSync(fullPath).isDirectory()) {
                if (fs.readdirSync(fullPath).includes('.git')) {
                    dirs.push(fullPath)
                }
                dirs.push(...traverseDir(fullPath, ignore))
            }
        }
    })
    return dirs
}

function addAllSubmodules(dirs) {
    let gitModuleMessage = ''
    let configMessage = '\n'
    dirs.forEach(dirWithoutGit => {
        try {
            const dir = path.join(dirWithoutGit, '.git')
            let lineTrue = false
            let url = ''
            const lines = fs.readFileSync(path.join(dir, 'config'), 'utf-8').split('\n')
            lines.forEach(line => {
                if (lineTrue) {
                    url = line.split(' ')[2]
                    lineTrue = false
                }
                if (line == '[remote "origin"]') {
                    lineTrue = true
                    console.log('found origin')
                }
            })
            const urlSplit = url.split('/').pop().split('.')[0]
            console.log(urlSplit)
            dirWithoutGit = dirWithoutGit.split('\\').splice(4).join('\\')
            gitModuleMessage += `[submodule "${urlSplit}"]\n\tpath = ${dirWithoutGit}\n\turl = ${url}\n`
            configMessage += `[submodule "${urlSplit}"]\n\turl = ${url}\n\tactive = true\n`
        } catch (error) {
            console.log(error)
        }
    })
    return [gitModuleMessage, configMessage]
}

const startDir = path.join('C:', 'Brothers', 'Charan', 'Code')
const allGit = traverseDir(startDir, [
    path.join(startDir, '.git'),
    path.join(startDir, 'SandBox'),
    path.join(startDir, 'Tutorials'),
])
console.log(allGit)
const [gitModuleMessage, configMessage] = addAllSubmodules(allGit)
fs.writeFileSync(path.join(startDir, '.gitmodules'), gitModuleMessage)
fs.appendFileSync(path.join(startDir, '.git', 'config'), configMessage)

/*
let lineTrue = false
let url = ''
let lines = fs
    .readFileSync('C:/Brothers/Charan/Code/Javascript/Projects/calculator_react_app/.git/config', 'utf-8')
    .split('\n')
for (let line of lines) {
    if (lineTrue) {
        url = line.split(' ')[2]
        break
    }
    if (line == '[remote "origin"]') {
        lineTrue = true
    }
}
let message = `[submodule "${url.split('/').pop()}"]\n\tpath = Javascript/Projects/calculator_react_app\n\turl = ${url}`
fs.writeFileSync('./.gitmodules', message)*/
/*
let lineTrue = false
rd.on('line', function (line, lineCount, byteCount) {
    if (lineTrue) {
        const url = line.split(' ')[2]
        return { url }
    }
    if ('[remote "origin"]' === line) {
        lineTrue = true
    }
})
*/

/*
[submodule "React-Calculator"]
	path = Javascript/Projects/calculator_react_app
	url = https://github.com/ChurroC/React-Calculator
[submodule "Shopping-Cart-With-React"]
	path = Javascript/Projects/ShoppingCart
	url = https://github.com/ChurroC/Shopping-Cart-With-React
*/

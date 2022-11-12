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
            if (url.slice(url.length - 4, url.length) === '.git') url = url.slice(0, url.length - 4)
            const urlSplit = url.split('/').pop().split('.')[0]
            console.log(urlSplit)
            dirWithoutGit = dirWithoutGit.split('\\').splice(4).join('/')
            gitModuleMessage += `[submodule "${urlSplit}"]\n\tpath = ${dirWithoutGit}\n\turl = ${url}\n`
            configMessage += `[submodule "${urlSplit}"]\n\turl = ${url}\n\tactive = true\n`
        } catch (error) {
            console.log(error)
        }
    })
    return [gitModuleMessage, configMessage]
}

const ignoreDirs = process.env.IGNORE_DIRS_ARRAY.split(',')
const allGit = traverseDir(
    process.env.START_DIR,
    ignoreDirs.map(dir => path.join(process.env.START_DIR, dir))
)
const [gitModuleMessage, configMessage] = addAllSubmodules(allGit)
fs.writeFileSync(path.join(process.env.START_DIR, '.gitmodules'), gitModuleMessage)
fs.appendFileSync(path.join(process.env.START_DIR, '.git', 'config'), configMessage)

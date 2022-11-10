//This will search recursively and return the found file(s) as an array.

const fs = require('fs')
const path = require('path')
const readline = require('linebyline')

async function folderWithGit(targetPath, findDir) {
    const files = await fs.promises.readdir(targetPath)
    const result = []

    for (let file of files) {
        try {
            const filepath = path.join(targetPath, file)
            const stats = await fs.promises.lstat(filepath)

            if (stats.isDirectory()) {
                const childFiles = await fs.promises.readdir(filepath)
                if (childFiles.includes(findDir)) {
                    result.push(filepath)
                }
                files.push(...childFiles.map(f => path.join(file, f)))
            }
        } catch (err) {
            console.error(err)
        }
    }
    return result
}

function addSubmodule(targetDir) {
    const result = folderWithGit('C:/Brothers/Charan/Code/Javascript/Projects', '.git')
    for (let dir of result) {
        const data = fs.readFileSync(path.join(dir, '.git', 'config'))
        console.log(data)
    }
    const message = `[submodule "React-Calculator"]/n\tpath = Javascript/Projects/calculator_react_app\n\turl = https://github.com/ChurroC/React-Calculator`
    fs.writeFileSync(path.join(targetDir, '.gitmodules'), message)
}

const run = async () => {
    try {
        const found = await search('C:/Brothers/Charan/Code/Javascript/Projects', '.git')
        console.log(found)
    } catch (err) {
        console.error(err)
    }
}

//addSubmodule('C:/Brothers/Charan/Code')
let lineTrue = false
let lines = fs
    .readFileSync('C:/Brothers/Charan/Code/Javascript/Projects/calculator_react_app/.git/config', 'utf-8')
    .split('\n')
for (let line of lines) {
    if (lineTrue) {
        const url = line.split(' ')[2]
        console.log(url)
        break
    }
    if (line == '[remote "origin"]') {
        lineTrue = true
    }
}
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

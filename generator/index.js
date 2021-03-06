module.exports = (api, options) => {
	function findFileInNamed (files, name) {
		const searchName = `/${name.toLowerCase()}`
		return Object.keys(files).find(fileName => fileName.toLowerCase().includes(searchName))
	}

	api.extendPackage({
		postcss: undefined,

		devDependencies: {
			"@fullhuman/postcss-purgecss": "^1.2.0",
			"postcss-preset-env": "^6.6.0",
			"tailwindcss": "^1.0.1",
		},
	})

	api.render('./templates', options)

	api.postProcessFiles(files => {
		const importRelativePath = 'assets/styles/tailwind'
		const searchName = 'App.vue'
		const appFileName = findFileInNamed(files, searchName)
		const importExtension = 'postcss'
		if (!appFileName) {
			return api.exitLog(`${searchName} file not found. Please import '${importRelativePath}' manually.`, 'error')
		}
		const appFileString = files[appFileName]
		if (appFileString.includes(importRelativePath)) {
			return
		}
		const mainFileString = files[findFileInNamed(files, 'main.')]
		if (mainFileString && mainFileString.includes(importRelativePath)) {
			return
		}
		const importStatement = `\n@import '${importRelativePath}.${importExtension}';\n`
		const lines = appFileString.split(/\r?\n/g)
		const styleIndex = lines.findIndex(line => line.startsWith('<style'))
		if (styleIndex !== -1) {
			lines[styleIndex] += importStatement
		} else {
			lines[lines.length - 1] += `\n<style lang="postcss">${importStatement}\n</style>\n`
		}
		files[appFileName] = lines.join('\n')
	})
}

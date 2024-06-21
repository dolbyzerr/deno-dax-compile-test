import $ from "@david/dax"

const output = await $`echo "hello world"`.text() 
console.log(output)

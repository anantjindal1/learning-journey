// Primitives — same as Java
const name: string = "Anant"
const age: number = 35
const isReady: boolean = true

// Arrays
const scores: number[] = [95, 87, 92]
const names: string[] = ["Alice", "Bob"]

// Functions with typed params and return type
function greet(name: string, age: number): string {
  return `Hello ${name}, you are ${age} years old`
}

// Arrow function (modern style — use this)
const add = (a: number, b: number): number => a + b

console.log(greet(name, age))
console.log(add(2, 3))
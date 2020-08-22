ex = []
seen = []
__input.forEach(io => (ex.includes(io.name)) ? null : (() => { seen.push(io.name); ex.push(io) })());
ex = []
seen = []
__input.forEach(io => (seen.includes(io.name)) ? null : (() => { seen.push(io.name); ex.push(io) })());
JSON.stringify(ex)
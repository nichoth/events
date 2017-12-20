function namespace (arr, ns) {
    ns = ns || ''
    if (Array.isArray(arr)) return arr.reduce(function (acc, name) {
        acc[name] = ns + '.' + name
        return acc
    }, {})

    return Object.keys(arr).reduce(function (acc, k) {
        acc[k] = namespace(arr[k], ns ? (ns + '.' + k) : k)
        return acc
    }, {})
}

module.exports = namespace


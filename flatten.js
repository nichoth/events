function flatten (tree) {
    return Object.keys(tree).reduce(function (acc, k) {
        return acc.concat(typeof tree[k] === 'string' ?
            tree[k] :
            flatten(tree[k])
        )
    }, [])
}

module.exports = flatten


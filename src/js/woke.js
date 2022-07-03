export default woke = {
    validHTML(element) {
        return document.createElement(element.toUpperCase()).toString() != "[object HTMLUnknownElement]";
    },

    createElement(nodeName, attributes, ...args) {
        console.log("createElement()")
        console.log(nodeName)
        console.log(attributes)
        console.log(args)

        let children = args.length ? [].concat(...args) : null
        const element = { nodeName, attributes, children }

        console.log('createElement(nodeName: %o, attributes: %o, args: %o)', nodeName, attributes, args)
        console.log('\treturn: %o', element)
        return element;
    },

    Fragment() {

    },

    render(vnode) {
        // Check for 'String'
        if (vnode.split) {
            // For Strings I just create TextNodes
            return document.createTextNode(vnode)
        }

        let element
        if (woke.validHTML(vnode.nodeName)) {
            element = document.createElement(vnode.nodeName)
        }
        else {
            console.log("TODO")
        }

        // Copy attributes onto the new element
        let attributes = {}
        attributes = vnode.attributes || {};
        Object.keys(attributes).forEach(a => { element.setAttribute(a, attributes[a]) })

        // render (build) and then append child nodes:
        if (Array.isArray(vnode.children)) {
            (vnode.children || []).forEach(child => element.appendChild(woke.render(child)));
        }
        else {
            console.log("vnode.children is not an Array")
            console.log(vnode.children)
        }

        return element;
    },

    awake: () => { },

    run(id) {
        if (!id || !(id.split)) {
            id = "woke"
        }

        let dom = woke.render(woke.awake())

        let root = document.getElementById(id)
        root.innerHTML = ""

        root.appendChild(dom)
    }
}
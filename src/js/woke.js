export default woke = {
    validHTML(element) {
        return document.createElement(element.toUpperCase()).toString() != "[object HTMLUnknownElement]";
    },

    createElement(nodeName, attributes, ...children) {
        return { nodeName, attributes, children };
    },

    Fragment() {

    },

    render(vnode) {
        // For Strings I just create TextNodes
        if (typeof vnode === 'string') {
            return document.createTextNode(vnode)
        }

        let node
        if (woke.validHTML(vnode.nodeName)) {
            node = document.createElement(vnode.nodeName)
        }
        else {
            console.log("TODO: Render User-defined components")
            return null
        }

        // Copy attributes onto the new node
        for (let name in Object(vnode.attributes)) {
            node.setAttribute(name, vnode.attributes[name])
        }

        // Render child nodes and then append them
        for (let i = 0; i < vnode.children.length; i++) {
            let child = woke.render(vnode.children[i])
            node.appendChild(child)
        }

        return node;
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
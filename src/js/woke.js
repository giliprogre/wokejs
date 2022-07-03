export default woke = {
    dirtyVDOM: 0,

    VDOMisDirty() {
        const res = woke.dirtyVDOM > 0
        console.log("VDOMisDirty() -> %o", res)
        return res
    },

    tarnishVDOM() {
        woke.dirtyVDOM++
        console.log("tarnishVDOM() -> %o", woke.dirtyVDOM)
    },

    cleanVDOM() {
        if (woke.dirtyVDOM > 0) {
            woke.dirtyVDOM--
        }
        console.log("cleanVDOM() -> %o", woke.dirtyVDOM)
    },

    validHTML(element) {
        return document.createElement(element.toUpperCase()).toString() != "[object HTMLUnknownElement]";
    },

    createElement(nodeName, attributes, ...children) {
        return { nodeName, attributes, children };
    },

    Fragment() {

    },

    updateState(value) {
        woke.tarnishVDOM()
        return value
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
            if (name === 'onEvent') {
                console.log('event: %s -> callback: %o', vnode.attributes[name][0], vnode.attributes[name][1])
                node.addEventListener(vnode.attributes[name][0], () => {
                    woke.tarnishVDOM()
                    vnode.attributes[name][1]()
                })
            }
            else {
                node.setAttribute(name, vnode.attributes[name])
            }
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

        const renderLoop = () => {
            if (woke.VDOMisDirty()) {
                // Have to render another pass
                try {
                    let dom = woke.render(woke.awake())
                    let root = document.getElementById(id)
                    root.innerHTML = ""
                    root.appendChild(dom)
                } catch (error) {
                    console.log(error)
                }
                woke.cleanVDOM()
            }

            setTimeout(renderLoop, 40);
        }

        woke.tarnishVDOM()
        renderLoop()
    }
}
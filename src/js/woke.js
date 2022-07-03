export default woke = {
    dirtyVDOM: 0,

    VDOMisDirty() {
        const res = woke.dirtyVDOM > 0
        return res
    },

    tarnishVDOM() {
        woke.dirtyVDOM++
    },

    cleanVDOM() {
        if (woke.dirtyVDOM > 0) {
            woke.dirtyVDOM--
        }
    },

    addElement2DOM(node, element) {
        if (Array.isArray(element)) {
            for (let i = 0; i < element.length; i++) {
                //console.log("1 - node.appendChild(%o)", element[i])
                node.appendChild(element[i])
            }
        }
        else {
            //console.log("2 - node.appendChild(%o)", element)
            node.appendChild(element)
        }
    },

    validHTML(element) {
        if (!element) {
            return false
        }
        return document.createElement(element.toUpperCase()).toString() != "[object HTMLUnknownElement]";
    },

    createElement(nodeName, attributes, ...children) {
        return { nodeName, attributes, children };
    },

    Fragment(nodeName, attributes, ...children) {
        return { nodeName: "__Fragment", attributes: null, children };
    },

    updateState(value) {
        woke.tarnishVDOM()
        return value
    },

    renderVDOM(vnode) {
        if (!vnode) {
            return null
        }

        // For Strings I just create TextNodes
        if (typeof vnode === 'string') {
            return document.createTextNode(vnode)
        }

        if (typeof vnode.nodeName === "function") {
            let children = []
            for (let i = 0; i < vnode.children.length; i++) {
                children.push(woke.renderVDOM(vnode.children[i]))
            }
            return children
        }

        let node
        if (woke.validHTML(vnode.nodeName)) {
            node = document.createElement(vnode.nodeName)
        }
        else {
            console.log("Trying to render vnode: %o", vnode)
            console.log("TODO: Render User-defined components")
            return null
        }

        // Copy attributes onto the new node
        for (let name in Object(vnode.attributes)) {
            if (name === 'onEvent') {
                node.addEventListener(vnode.attributes[name][0], () => {
                    vnode.attributes[name][1]()
                    woke.tarnishVDOM()
                })
            }
            else {
                node.setAttribute(name, vnode.attributes[name])
            }
        }

        // Render child nodes and then append them
        for (let i = 0; i < vnode.children.length; i++) {
            let child = woke.renderVDOM(vnode.children[i])
            if (child && typeof child !== 'string' && child !== '') {
                woke.addElement2DOM(node, child)
            }
        }

        return node;
    },

    renderDiff(dom, vdom) {
        if (Array.isArray(vdom)) {
            console.log("compare dom with a vdom of multiple elements")
            for (let i = 0; i < Object.keys(vdom).length; i++) {
                let node = dom[i]
                let vnode = Object.keys(vdom)[i]
            }
        }
        else {
            if (dom.length > 0) {
                console.log("compare dom with a vdom of a single element")
            }
            else {
                console.log("no dom to compare with, render vdom")
            }
        }
    },

    app: () => { },

    awake(id) {
        if (!id || !(id.split)) {
            id = "woke"
        }

        let new_vdom = null
        let old_vdom = null
        let root = null
        let new_dom = null

        const renderLoop = () => {
            if (woke.VDOMisDirty()) {
                // Have to render another pass
                try {
                    old_vdom = new_vdom
                    new_vdom = woke.app()

                    root = document.getElementById(id)
                    new_dom = woke.renderVDOM(new_vdom)
                    if (new_dom) {
                        root.innerHTML = ""
                        woke.addElement2DOM(root, new_dom)
                    }
                } catch (error) {
                    console.log(error)
                }
                woke.cleanVDOM()
            }

            setTimeout(renderLoop, 40);
        }

        const renderLoop2 = () => {
            if (woke.VDOMisDirty()) {
                // Have to render another pass
                try {
                    let vdom = woke.app()
                    let root = document.getElementById(id)
                    woke.renderDiff(root.childNodes, vdom)
                } catch (error) {
                    console.log(error)
                }
                woke.cleanVDOM()
            }

            setTimeout(renderLoop, 40);
        }

        woke.tarnishVDOM()
        renderLoop()
        //renderLoop2()
    }
}
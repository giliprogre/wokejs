export default woke = {
    __dirtyVDOM: 0,
    __debug: true,
    __info: true,
    __print: true,

    debug(...val) {
        if (woke.__debug) {
            console.log(...val)
        }
    },

    info(...val) {
        if (woke.__info) {
            console.log(...val)
        }
    },

    print(...val) {
        if (woke.__print) {
            console.log(...val)
        }
    },

    compareNode2VNode(node, vnode) {
        if(node)
        return null
    },

    VDOMisDirty() {
        const res = woke.__dirtyVDOM > 0
        return res
    },

    tarnishVDOM() {
        woke.__dirtyVDOM++
    },

    cleanVDOM() {
        if (woke.__dirtyVDOM > 0) {
            woke.__dirtyVDOM--
        }
    },

    addElement2DOM(node, element) {
        if (Array.isArray(element)) {
            for (let i = 0; i < element.length; i++) {
                woke.debug("1 - node.appendChild(%o)", element[i])
                node.appendChild(element[i])
            }
        }
        else {
            woke.debug("2 - node.appendChild(%o)", element)
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
            woke.debug("Trying to render vnode: %o", vnode)
            woke.debug("TODO: Render User-defined components")
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
        woke.debug("renderDiff(dom: %o, vdom: %o)", dom, vdom)
        woke.debug("NODE: %o", dom)
        woke.debug("VNODE: %o", vdom)

        if ((dom && Object.prototype.isPrototypeOf.call(NodeList.prototype, dom)) && (vdom && Array.isArray(vdom))) {
            woke.debug("Both dom & vdom are lists, dom is a NodeList & vdom is an array")
            woke.debug("Compare [] to []")
        }
        else if (dom && Object.prototype.isPrototypeOf.call(NodeList.prototype, dom)) {
            woke.debug("dom is a NodeList, vdom is an element")
            woke.debug("Compare [] to element. NodeList can be empty, and element can be null")
        }
        else if (vdom && Array.isArray(vdom)) {
            woke.debug("dom is an element, vdom is an array")
            woke.debug("Compare element to []. Array can be empty, and element can be null")
        }
        else if (dom && vdom) {
            woke.debug("Both dom & vdom exist, and both of them are elements")
            woke.debug("Compare element to element")
        }
        else if (dom && !vdom) {
            woke.debug("dom exists, and vdom doesn't")
            woke.debug("Have to destroy dom node")
        }
        else if (!dom && vdom) {
            woke.debug("vdom exists, and dom doesn't")
            woke.debug("Create new dom node from vnode")
        }
        else {
            woke.print("ERROR - you shouldn't get here")
            throw("Renderer - Diff error.")
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
                    woke.debug(error)
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
                    woke.debug(error)
                }
                woke.cleanVDOM()
            }

            setTimeout(renderLoop, 40);
        }

        woke.tarnishVDOM()
        //renderLoop()
        renderLoop2()
    }
}
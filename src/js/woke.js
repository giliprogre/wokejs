let woke = {
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

    addChild2Node(node, child) {
        if (Array.isArray(child)) {
            for (let i = 0; i < child.length; i++) {
                node.appendChild(child[i])
            }
        }
        else {
            node.appendChild(child)
        }
    },

    diffNode2VNode(node, vnode) {
        let nodeName = node.nodeName;
        let vnodeName = vnode.nodeName;
        if (nodeName != vnodeName) {
            return true
        }
        return false
    },

    diffAttributes(node, vnode) {
        // Copy attributes onto the new node
        for (let name in Object(vnode.attributes)) {
            if (name === 'onEvent') {
                node.addEventListener(vnode.attributes[name][0], () => {
                    vnode.attributes[name][1]()
                    woke.tarnishVDOM()
                })
            }
            else {
                let old_attr = node.getAttribute(name)
                let new_attr = vnode.attributes[name]
                if (old_attr != new_attr) {
                    node.setAttribute(name, new_attr)
                }
            }
        }
    },

    copyAttributes(node, vnode) {
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

        woke.diffAttributes(node, vnode)

        // Render child nodes and then append them
        for (let i = 0; i < vnode.children.length; i++) {
            let child = woke.renderVDOM(vnode.children[i])
            if (child && typeof child !== 'string' && child !== '') {
                woke.addChild2Node(node, child)
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

            if (!vdom) {
                woke.debug("vdom is null")
                woke.debug("Destroy all subelements of the NodeList")
                for (let i = dom.length - 1; i >= 0; i--) {
                    dom[i].remove()
                }
                return null
            }

            if (dom.length > 0) {
                woke.debug("Destroy all subelements of the NodeList, except fot the 1st one")
                for (let i = dom.length - 1; i > 0; i--) {
                    dom[i].remove()
                }

                if (woke.diffNode2VNode(dom[0], vdom)) {
                    let new_node = woke.renderVDOM(vdom)
                    dom[0].parentElement.appendChild(new_node)
                    dom[0].remove()
                    return new_node
                }
                else {
                    woke.diffAttributes(dom[0], vdom)
                    let result = woke.renderDiff(dom[0].childNodes, vdom.children)
                    woke.debug("woke.renderDiff(dom: %o, vdom: %o) => %o", dom[0].childNodes, vdom.children, result)
                    return null
                }
            }
            else {
                let new_node = woke.renderVDOM(vdom)
                return new_node
            }
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
            throw ("Renderer - Diff error.")
        }
    },

    app: () => { },

    awake(_id) {
        let id = _id
        if (!id) {
            woke.id = "root"
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
                        woke.addChild2Node(root, new_dom)
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

export default woke
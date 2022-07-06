let woke = {
    __dirtyVDOM: 0,
    __debug: true,
    __info: true,
    __print: true,

    State: class {
        #dirty = false
        get dirty() { console.log('getting dirty'); return this.#dirty }

        isDirty() {
            return this.#dirty
        }

        tarnishComponent() {
            this.#dirty = true
            woke.tarnishVDOM()
        }

        cleanComponent() {
            this.#dirty = false
        }
    },

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

    renderDiff(dom, _vdom) {
        woke.debug("renderDiff(dom: %o, vdom: %o)", dom, _vdom)
        woke.debug("NODE: %o", dom)
        woke.debug("VNODE: %o", _vdom)

        let vdom
        if (typeof _vdom.nodeName === 'function') {
            let inner_vdom
            woke.debug("vdom.nodeName: %o = %o", typeof _vdom.nodeName, _vdom.nodeName)
            let component_pronouns = _vdom.nodeName.pronouns
            woke.debug("vdom.nodeName.pronouns => %o", component_pronouns)
            inner_vdom = _vdom.nodeName.call()
            if (typeof inner_vdom.nodeName === 'function' && inner_vdom.nodeName.name === 'Fragment') {
                woke.debug("Analizing Fragment")
                inner_vdom = inner_vdom.children
            }
            woke.debug("inner_vdom: %o", inner_vdom)
            vdom = inner_vdom
        }
        else {
            vdom = _vdom
        }

        woke.debug("renderDiff final VDOM to render: %o", vdom)


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
                    woke.debug("dom[0]: %o, vdom: %o", dom[0], vdom)
                    new_node = woke.renderVDOM(vdom)
                    woke.debug("new_node: %o", new_node)
                    if (Array.isArray(new_node)) {
                        for (let n = 0; n < new_node.length; n++) {
                            dom[0].parentElement.appendChild(new_node[n])
                        }
                    }
                    else {
                        dom[0].parentElement.appendChild(new_node)
                    }
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

    isHtmlVNode(vnode) {
        return (vnode && typeof vnode.nodeName === 'string')
    },

    bindComponentState(vnode, state) {
        let _state
        if (!state) {
            woke.debug("No additional state has been provided")
            woke.debug("Binding Function Component to default state")
            _state = new vnode.nodeName.defaultState
        }
        else {
            woke.debug("An additional state has been provided")
            woke.debug("Binding Function Component to the provided state")
            _state = state
        }
        woke.debug("Setting state")
        vnode.nodeName.state = _state
        woke.debug("The state that the function is going to be bound to: %o", _state)
        let f = vnode.nodeName
        woke.debug("The previous function is: %o", f)
        vnode.nodeName = vnode.nodeName.bind(vnode.nodeName.state)
        woke.debug("Saving state into new function")
        vnode.nodeName.state = _state
        woke.debug("The bound function is: %o", vnode.nodeName)
        return vnode
    },

    isComponentVNode(vnode) {
        return (vnode && typeof vnode.nodeName === 'function')
    },

    isTextVNode(vnode) {
        return (vnode && typeof vnode === 'string')
    },

    isFragmentVNode(vnode) {
        return (vnode && typeof vnode.nodeName === 'function' && vnode.nodeName.name === 'Fragment')
    },

    isDirtyComponentVNode(vnode) {
        return (vnode && typeof vnode.nodeName === 'function' && vnode.dirty)
    },

    vnodeHasDirtyProp(vnode) {
        return vnode.hasOwnProperty('dirty')
    },

    isDirty(vnode) {
        if (vnode && woke.vnodeHasDirtyProp(vnode)) {
            return vnode.dirty
        }
        else {
            return true
        }

    },

    parseVTree(vdom) {
        if (!vdom) {
            woke.debug("null vnode, probably a leaf")
            return null
        }

        let vnode = vdom

        if (woke.isHtmlVNode(vnode)) {
            woke.debug("vnode is a normal html element")
            woke.debug("subtree is in .children[]")

            let children = []
            for (let i = 0; i < vnode.children.length; i++) {
                let child = woke.parseVTree(vnode.children[i])
                children.push(child)
            }
            vnode.vdom = children
        }
        else if (Array.isArray(vnode)) {
            woke.debug("vnode is an Array")
            let children = []
            for (let i = 0; i < vnode.length; i++) {
                let child = woke.parseVTree(vnode[i])
                children.push(child)
            }
            vnode.vdom = children
        }
        else if (woke.isComponentVNode(vnode)) {
            woke.debug("vnode is a Component")

            if (!woke.vnodeHasDirtyProp(vnode)) {
                woke.debug("First render of this Component")
                woke.debug("Set state of this Component for the 1st time")
                vnode = woke.bindComponentState(vnode)
                vnode.dirty = true
            }
            else {
                woke.debug("This Component has previous state")
            }

            if (woke.isFragmentVNode(vnode)) {
                woke.debug("vnode is a Fragment Component")
                woke.debug("Analizing Fragment")

                if (vnode.dirty) {
                    let subvdom = vnode.children
                    vnode.vdom = woke.parseVTree(subvdom)
                    vnode.dirty = false
                }
            }
            else {
                woke.debug("vnode is a Component Function")

                if (vnode.dirty) {
                    woke.debug("vnode is dirty")
                    woke.debug("Have to recreate it's vdom")
                    let subvdom = vnode.nodeName.call()
                    vnode.vdom = woke.parseVTree(subvdom)
                    vnode.dirty = false
                }
            }
        }
        else if (woke.isTextVNode(vnode)) {
            woke.debug("vnode is an Array")
            return vnode
        }
        else {
            woke.debug("vnode of unexpected kind: %o", vnode)
            return null
        }

        if (!vnode) {
            woke.debug('The resulting vnode is null/undefined')
            return null
        }
        else {
            return vnode
        }
    },

    app: () => { },

    awake(_id) {
        let id = _id
        if (!id) {
            woke.id = "root"
        }

        let root = null
        let new_dom = null
        let old_vdom = null
        let new_vdom = 42

        const renderLoop = () => {
            if (woke.VDOMisDirty()) {
                woke.info("--- BEGIN RENDER PASS ---")
                // Have to render another pass
                try {
                    let vdom = woke.app()
                    let root = document.getElementById(id)

                    woke.info("-- Objects before rendering --")
                    woke.info("root: %o", root)
                    woke.info("new_dom: %o", new_dom)
                    woke.info("old_vdom: %o", old_vdom)
                    woke.info("new_vdom: %o", new_vdom)

                    old_vdom = new_vdom

                    new_vdom = woke.parseVTree(vdom)
                    new_vdom.creationTime = new Date().getTime()

                    woke.info("-- Objects after rendering --")
                    woke.info("root: %o", root)
                    woke.info("new_dom: %o", new_dom)
                    woke.info("old_vdom: %o", old_vdom)
                    woke.info("new_vdom: %o", new_vdom)
                    //woke.renderDiff(root.childNodes, vdom)
                } catch (error) {
                    woke.debug(error)
                }
                woke.info("--- END RENDER PASS ---")
                woke.cleanVDOM()
            }

            setTimeout(renderLoop, 40);
        }

        woke.tarnishVDOM()
        renderLoop()
    }
}

export default woke
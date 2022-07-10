let woke = {
    __dirtyVDOM: 0,
    __debug: true,
    __info: true,
    __print: true,
    __tabDOM: 1,

    debug(...val) {
        if (woke.__debug) {
            console.log("   ".repeat(woke.__tabDOM) + val[0], ...val.slice(1))
        }
    },

    info(...val) {
        if (woke.__info) {
            console.log("   ".repeat(woke.__tabDOM) + val[0], ...val.slice(1))
        }
    },

    print(...val) {
        if (woke.__print) {
            console.log("   ".repeat(woke.__tabDOM) + val[0], ...val.slice(1))
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

    isDomElement(obj) {
        return obj instanceof HTMLElement;
    },

    intoDom() { woke.__tabDOM++ },

    outofDom() { woke.__tabDOM-- },

    State: class {
        #dirty = 0
        get dirty() { return this.#dirty }

        isDirty() {
            return this.#dirty > 0
        }

        tarnishComponent() {
            this.#dirty++
            woke.tarnishVDOM()
        }

        cleanComponent() {
            if (this.#dirty > 0) {
                this.#dirty--
            }
            else {
                this.#dirty = 0
            }
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

    diffVAttributes(node, vnode) {
        // Copy attributes onto the new node
        for (let name in Object(vnode.attributes)) {
            if (/^on\w+$/g.test(name)) {
                let eventName = name.slice(2).toLowerCase()
                node.addEventListener(eventName, vnode.attributes[name])
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

    copyVAttributes(src, dst) {
        // Copy attributes onto the new node
        for (let name in Object(src.attributes)) {
            if (/^on\w+$/g.test(name)) {
                let eventName = name.slice(2).toLowerCase()
                dst.addEventListener(eventName, src.attributes[name])
            }
            else {
                let attrValue = src.attributes[name]
                if (attrValue) {
                    dst.setAttribute(name, attrValue)
                }
            }
        }
    },

    diffAttributes(src, dst) {
        // Copy src attributes onto dst
        for (let i = 0; i < src.attributes.length; i++) {
            let name = src.attributes[i].name
            if (/^on\w+$/g.test(name)) {
                let eventName = name.slice(2).toLowerCase()
                dst.addEventListener(eventName, src.attributes[i].value)
            }
            else {
                let src_attrValue = src.attributes[i].value
                let dst_attrValue = dst.getAttribute(name)
                if (src_attrValue && dst_attrValue && src_attrValue !== dst_attrValue) {
                    dst.setAttribute(name, attrValue)
                }
            }
        }
    },

    copyAttributes(src, dst) {
        // Copy src attributes onto dst
        for (let i = 0; i < src.attributes.length; i++) {
            let name = src.attributes[i].name
            if (/^on\w+$/g.test(name)) {
                let eventName = name.slice(2).toLowerCase()
                dst.addEventListener(eventName, src.attributes[i].value)
            }
            else {
                let attrValue = src.attributes[i].value
                if (attrValue) {
                    dst.setAttribute(name, attrValue)
                }
            }
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

    isHtmlVNode(vnode) {
        return (vnode && typeof vnode.nodeName === 'string')
    },

    bindComponentState(vnode, state) {
        let _state
        if (!state) {
            if (vnode.nodeName.state) {
                _state = vnode.nodeName.state
            }
            else if (vnode.nodeName.defaultState) {
                _state = new vnode.nodeName.defaultState
            }
            else {
                _state = new woke.State
            }
        }
        else {
            _state = state
        }
        vnode.nodeName.state = _state
        let f = vnode.nodeName
        vnode.nodeName = vnode.nodeName.bind(vnode.nodeName.state)
        vnode.nodeName.state = _state
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

    isDirtyComponent(vnode) {
        if (woke.isComponentVNode(vnode)
            && vnode.state
            && vnode.state.dirty
        ) {
            return vnode.state.dirty
        }
        else {
            return true
        }
    },

    cleanComponent(vnode) {
        if (woke.isComponentVNode(vnode)
            && vnode.state
            && vnode.state.dirty
        ) {
            vnode.state.dirty = false
        }
    },

    vnodeHasStateProp(vnode) {
        return vnode.hasOwnProperty('state')
    },

    vnodeHasDirtyProp(vnode) {
        if (woke.vnodeHasStateProp(vnode)) {
            return vnode.state.hasOwnProperty('dirty')
        }
        else {
            return false
        }
    },

    isDirty(vnode) {
        if (vnode && woke.vnodeHasDirtyProp(vnode)) {
            return vnode.state.dirty
        }
        else {
            return true
        }

    },

    getVNodeType(vnode) {
        if (woke.isHtmlVNode(vnode)) {
            return 'Html'
        }
        else if (woke.isTextVNode(vnode)) {
            return 'Text'
        }
        else if (woke.isComponentVNode(vnode)) {
            return 'Component'
        }
        else if (woke.isFragmentVNode(vnode)) {
            return 'Fragment'
        }
        else {
            return null
        }
    },

    createNewDom(_vnode) {
        if (!_vnode) {
            return null
        }

        if (woke.isDomElement(_vnode)) {
            return _vnode
        }

        let vnode = _vnode
        let node = null

        if (woke.isHtmlVNode(vnode)) {
            node = document.createElement(vnode.nodeName)
        }
        else if (woke.isTextVNode(vnode)) {
            node = document.createTextNode(vnode)
        }
        else if (Array.isArray(vnode)) {
            node = []
            for (let i = 0; i < vnode.length; i++) {
                let child = woke.createNewDom(vnode[i])
                node.push(child)
            }
        }
        else if (woke.isComponentVNode(vnode)) {
            if (woke.isFragmentVNode(vnode)) {
                node = woke.createNewDom(vnode.vdom)
            }
            else {
                node = woke.createNewDom(vnode.vdom)
            }
        }
        else {
            node = String(vnode)
            node = document.createTextNode(node)
            return node
        }

        if (vnode.attributes) {
            woke.copyVAttributes(vnode, node)
        }


        if (!vnode.vdom) {
            if (Array.isArray(node) && node.length == 1) {
                node = node[0]
            }
            return node
        }
        else if (Array.isArray(node)) {
            return node
        }
        else {
            let children = woke.createNewDom(vnode.vdom)
            if (!children) {
                return node
            }
            else if (Array.isArray(children)) {
                for (let i = 0; i < children.length; i++) {
                    let childNode = woke.createNewDom(children[i])
                    if (!childNode) {
                        woke.debug("createNewDom() - Appending Children - .vdom[%i] is null. Probably an error. Skipping.", i)
                    }
                    if (Array.isArray(childNode)) {
                        for (let j = 0; j < childNode.length; j++) {
                            if (Array.isArray(node)) {
                                node.push(childNode[j])
                            }
                            else {
                                node.appendChild(childNode[j])
                            }
                        }
                    }
                    else {
                        if (Array.isArray(node)) {
                            node.push(childNode)
                        }
                        else {
                            node.appendChild(childNode)
                        }
                    }
                }
            }
            else {
                if (Array.isArray(node)) {
                    node.push(children)
                }
                else {
                    node.appendChild(children)
                }
            }
        }

        return node
    },

    updateVDom(_vnode) {
        if (!_vnode) {
            return null
        }

        let vnode = _vnode

        if (woke.isHtmlVNode(vnode)) {
            if (!vnode.children) {
                woke.debug("updateVDom() - HtmlVNode - vnode.children doesn't exist, it's a leaf vnode")
                woke.debug("updateVDom() - HtmlVNode - TODO: Update leaf HtmlVNode.")
            }
            else if (!vnode.vdom) {
                let children = []
                let i
                for (i = 0; i < vnode.children.length; i++) {
                    let child = woke.updateVDom(vnode.children[i])
                    children.push(child)
                }

                vnode.vdom = children
            }
            else if (vnode.vdom.length != vnode.children.length) {
                woke.debug("updateVDom() - HtmlVNode - # of children changed.")
                woke.debug("updateVDom() - HtmlVNode - TODO: Rerender different # of children.")
            }
            else {
                for (let i = 0; i < vnode.vdom.length; i++) {
                    vnode.vdom[i] = woke.updateVDom(vnode.vdom[i])
                }
            }
        }
        else if (woke.isTextVNode(vnode)) {

        }
        else if (Array.isArray(vnode)) {
            if (!vnode.vdom) {
                let children = []
                let i
                for (i = 0; i < vnode.length; i++) {
                    let child = woke.updateVDom(vnode[i])
                    children.push(child)
                }

                vnode.vdom = children
            }
        }
        else if (woke.isComponentVNode(vnode)) {
            if (woke.isFragmentVNode(vnode)) {

                if (!vnode.vdom) {
                    let subvdom = vnode.children
                    vnode.vdom = woke.updateVDom(subvdom)
                }
                else if (vnode.children && vnode.vdom.length !== vnode.children.length) {
                    let subvdom = vnode.children
                    vnode.vdom = woke.updateVDom(subvdom)
                }
            }
            else {

                vnode = woke.bindComponentState(vnode)

                if (woke.isDirtyComponent(vnode)) {
                    let subvdom = vnode.nodeName.call()
                    vnode.vdom = woke.updateVDom(subvdom)
                    woke.cleanComponent(vnode)
                }
            }
        }
        else {
            woke.debug("updateVDom() - vnode of unexpected kind: %o", vnode)
            return vnode
        }

        return vnode
    },

    renderDiff(node, new_node) {
        woke.debug("woke.renderDiff()")
        woke.debug("pre node: %o", node)
        woke.debug("new node: %o", new_node)
        woke.debug("pre node name: %o", node.nodeName)
        woke.debug("new node name: %o", new_node.nodeName)

        if (node.nodeName !== new_node.nodeName) {
            woke.debug("renderDiff() NodeNames differ: node's '%s' vs new_node's '%s')", node.nodeName, new_node.nodeName)
        }
        else {
            woke.debug("renderDiff() NodeNames coincide: node's '%s' vs new_node's '%s')", node.nodeName, new_node.nodeName)
        }

        woke.diffAttributes(new_node, node)

        woke.debug("node.childNodes #: %o", node.childNodes.length)
        woke.debug("new_node.childNodes #: %o", new_node.childNodes.length)
        if (node.childNodes.length !== new_node.childNodes.length) {
            woke.debug("node has a different number of children with respect to new_node")
        }
        else {
            woke.debug("node and new_node have the same number of children")
            for(let i = 0; i < node.childNodes.length; i++)
            {
                woke.renderDiff(node.childNodes[i], new_node.childNodes[i])
            }
        }
    },

    app: () => { },

    awake(_id) {
        let id = _id
        if (!id) {
            woke.id = "root"
        }

        let root = document.getElementById(id)
        let new_dom = null
        let vdom = woke.app()

        const renderLoop = () => {
            if (woke.VDOMisDirty()) {
                // Have to render another pass
                try {
                    vdom = woke.updateVDom(vdom)

                    new_dom = woke.createNewDom(vdom)

                    // Copy the top root element into an unmounted node
                    let vroot = document.createElement(root.nodeName)
                    woke.copyAttributes(root, vroot)

                    // Attach the new_dom to the unmounted copied root node
                    if (Array.isArray(new_dom)) {
                        for (let i = 0; i < new_dom.length; i++) {
                            vroot.appendChild(new_dom[i])
                        }
                    }
                    else {
                        vroot.appendChild(new_dom)
                    }
                    // Now the unmounted node tree replicates the mounted one
                    woke.debug("Full unmounted tree: %o", vroot)
                    // Both trees can be compared
                    this.renderDiff(root, vroot)
                } catch (error) {
                    woke.print(error)
                }
                woke.cleanVDOM()
            }

            setTimeout(renderLoop, 40);
        }

        woke.tarnishVDOM()
        renderLoop()
    }
}

export default woke
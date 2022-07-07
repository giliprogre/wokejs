let woke = {
    __dirtyVDOM: 0,
    __debug: true,
    __info: true,
    __print: true,

    State: class {
        #dirty = false
        get dirty() { return this.#dirty }

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

    /*
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
    */

    isHtmlVNode(vnode) {
        return (vnode && typeof vnode.nodeName === 'string')
    },

    bindComponentState(vnode, state) {
        let _state
        if (!state) {
            woke.debug("bindComponentState() - No additional state has been provided")
            if (vnode.nodeName.state) {
                woke.debug("bindComponentState() - A previous state exists")
                woke.debug("bindComponentState() - Preserving previous state")
                _state = vnode.nodeName.state
            }
            else {
                woke.debug("bindComponentState() - No previous state ")
                woke.debug("bindComponentState() - Binding Function Component to default state")
                _state = new vnode.nodeName.defaultState
            }
        }
        else {
            woke.debug("bindComponentState() - An additional state has been provided")
            woke.debug("bindComponentState() - Binding Function Component to the provided state")
            _state = state
        }
        woke.debug("bindComponentState() - Setting state")
        vnode.nodeName.state = _state
        woke.debug("bindComponentState() - The state that the function is going to be bound to: %o", _state)
        let f = vnode.nodeName
        woke.debug("bindComponentState() - The previous function is: %o", f)
        vnode.nodeName = vnode.nodeName.bind(vnode.nodeName.state)
        woke.debug("bindComponentState() - Saving state into new function")
        vnode.nodeName.state = _state
        woke.debug("bindComponentState() - The bound function is: %o", vnode.nodeName)
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
        if(woke.isComponentVNode(vnode)
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
        if(woke.isComponentVNode(vnode)
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

    /*
    compareVNodes(oldVNnode, newVNode) {
        if (!oldVNnode) {
            woke.debug("compareVNodes() - oldVNode: %o. Have to render newVNode: %o", oldVNnode, newVNode)
            return false
        }
        else if (!newVNode) {
            woke.debug("compareVNodes() - newVNode: %o. Have to clear oldVNode: %o", newVNode, oldVNnode)
            return false
        }

        if (woke.getVNodeType(oldVNnode) !== woke.getVNodeType(newVNode)) { // VNodes of different kind
            woke.debug("compareVNodes() - VNodes of different kind; oldVNode's: %s, newVNode's: %s", woke.getVNodeType(oldVNnode), woke.getVNodeType(newVNode))
            return false
        }

        if (oldVNnode.children ? !newVNode.children : newVNode.children) { // XOR vnode.children
            woke.debug("compareVNodes() - One of the vnodes doesn't have a children attribute, while the other does. oldVNode: %o, newVNode: %o", oldVNnode, newVNode)
            return false
        }

        if (oldVNnode.children.length !== newVNode.children.length) {
            return false
        }

        return true
    },
    */

    parseVTree(_vnode) {
        woke.debug("parseVTree(vnode: %o)", _vnode)
        if (!_vnode) {
            woke.debug("parseVTree() - null vnode, probably a leaf")
            return null
        }

        let vnode = _vnode

        if (woke.isHtmlVNode(vnode)) {
            woke.debug("parseVTree() - HtmlNode - vnode is a html element")
            woke.debug("parseVTree() - HtmlNode - subtree is in .children[]")

            if (!vnode.vdom) {
                woke.debug("parseVTree() - HtmlNode - vnode.vdom doesn't exist.")
                woke.debug("parseVTree() - HtmlNode - First render, populating .vdom from .children")

                let children = []
                let i
                for (i = 0; i < vnode.children.length; i++) {
                    woke.debug("parseVTree() - HtmlNode - Parsing child[%i].", i)
                    let child = woke.parseVTree(vnode.children[i])
                    woke.debug("parseVTree() - HtmlNode - Done parsing child[%i].", i)
                    children.push(child)
                }

                woke.debug("parseVTree() - HtmlNode - Storing #%i children in .vdom", i + 1)
                vnode.vdom = children
            }
            else if (false) {
                woke.debug("parseVTree() - HtmlNode - # of children changed.")
                woke.debug("parseVTree() - HtmlNode - TODO: Rerender different # of children.")
            }
            else {
                woke.debug("parseVTree() - HtmlNode - vnode.vdom already exists.")
                woke.debug("parseVTree() - HtmlNode - # of children remains the same, parsing vdom")
                for (let i = 0; i < vnode.vdom.length; i++) {
                    woke.debug("parseVTree() - HtmlNode - Parsing .vdom[%i].", i)
                    vnode.vdom[i] = woke.parseVTree(vnode.vdom[i])
                    woke.debug("parseVTree() - HtmlNode - Done parsing .vdom[%i].", i)
                }
            }
        }
        else if (woke.isTextVNode(vnode)) {
            woke.debug("parseVTree() - TextNode - vnode is a TextNode")
        }
        else if (Array.isArray(vnode)) {
            woke.debug("parseVTree() - Array - vnode is an Array")
            if (!vnode.vdom) {
                woke.debug("parseVTree() - Array - vnode.vdom doesn't exist.")
                woke.debug("parseVTree() - Array - First render, populating .vdom from .children")

                let children = []
                let i
                for (i = 0; i < vnode.length; i++) {
                    woke.debug("parseVTree() - Array - Parsing child[%i].", i)
                    let child = woke.parseVTree(vnode[i])
                    woke.debug("parseVTree() - Array - Done parsing child[%i].", i)
                    children.push(child)
                }

                woke.debug("parseVTree() - Array - Storing #%i children in .vdom", i + 1)
                vnode.vdom = children
            }
        }
        else if (woke.isComponentVNode(vnode)) {
            woke.debug("parseVTree() - Component/Fragment - vnode is a Component")

            if (woke.isFragmentVNode(vnode)) {
                woke.debug("parseVTree() - Fragment - vnode is a Fragment")

                if (!vnode.vdom) {
                    woke.debug("parseVTree() - Fragment - First render")
                    woke.debug("parseVTree() - Fragment - Parsing children")
                    let subvdom = vnode.children
                    vnode.vdom = woke.parseVTree(subvdom)
                }
                else if (vnode.children && vnode.vdom.length !== vnode.children.length) {
                    woke.debug("parseVTree() - Fragment - The size of .children[] changed")
                    woke.debug("parseVTree() - Fragment - Parsing children")
                    let subvdom = vnode.children
                    vnode.vdom = woke.parseVTree(subvdom)
                }
            }
            else {
                woke.debug("parseVTree() - Component - vnode is a Component")

                vnode = woke.bindComponentState(vnode)

                if (woke.isDirtyComponent(vnode)) {
                    woke.debug("parseVTree() - Component - vnode is dirty")
                    woke.debug("parseVTree() - Component - Have to recreate it's vdom")
                    let subvdom = vnode.nodeName.call()
                    vnode.vdom = woke.parseVTree(subvdom)
                    woke.cleanComponent(vnode)
                }
            }
        }
        else {
            woke.debug("parseVTree() - vnode of unexpected kind: %o", vnode)
            return vnode
        }

        return vnode
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
        let vdom = woke.app()

        const renderLoop = () => {
            if (woke.VDOMisDirty()) {
                woke.info("--- BEGIN RENDER PASS ---")
                // Have to render another pass
                try {
                    let root = document.getElementById(id)

                    woke.info("-- Objects before rendering --")
                    woke.info("root: %o", root)
                    woke.info("vdom: %o", vdom)

                    vdom = woke.parseVTree(vdom)

                    woke.info("-- Objects after rendering --")
                    woke.info("root: %o", root)
                    woke.info("vdom: %o", vdom)
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
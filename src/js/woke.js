export default woke = {
    dirtyVDOM: 0,

    VDOMisDirty() {
        const res = woke.dirtyVDOM > 0
        //console.log("VDOMisDirty() -> %o", res)
        return res
    },

    tarnishVDOM() {
        woke.dirtyVDOM++
        //console.log("tarnishVDOM() -> %o", woke.dirtyVDOM)
    },

    cleanVDOM() {
        if (woke.dirtyVDOM > 0) {
            woke.dirtyVDOM--
        }
        //console.log("cleanVDOM() -> %o", woke.dirtyVDOM)
    },

    validHTML(element) {
        if (!element) {
            return false
        }

        //console.log("Checking valid HTML tag: %o", element)
        return document.createElement(element.toUpperCase()).toString() != "[object HTMLUnknownElement]";
    },

    createElement(nodeName, attributes, ...children) {
        return { nodeName, attributes, children };
    },

    Fragment(nodeName, attributes, ...children) {
        //console.log('Fragment(nodeName: %o, attributes: %o, children: %o)', nodeName, attributes, children)
        return { nodeName: "__Fragment", attributes: null, children };
    },

    updateState(value) {
        woke.tarnishVDOM()
        return value
    },

    renderVDOM(vnode) {
        if (!vnode) {
            console.log("woke.renderVDOM(%o)", vnode)
            return null
        }

        console.log("%o vnode: %o = %o", vnode.nodeName, typeof vnode, vnode)

        // For Strings I just create TextNodes
        if (typeof vnode === 'string') {
            console.log("vnode is a string, create a TextNode")
            return document.createTextNode(vnode)
        }

        if (typeof vnode.nodeName === "function") {
            console.log("vnode: %o is a Fragment, render its children: %o", vnode, vnode.children)

            let children = []
            for (let i = 0; i < vnode.children.length; i++)
            {
                children.push(woke.renderVDOM(vnode.children[i]))
            }
            return children
        }

        let node
        if (woke.validHTML(vnode.nodeName)) {
            node = document.createElement(vnode.nodeName)
        }
        else {
            //console.log("Trying to render vnode: %o", vnode)
            //console.log("TODO: Render User-defined components")
            return null
        }

        // Copy attributes onto the new node
        for (let name in Object(vnode.attributes)) {
            if (name === 'onEvent') {
                //console.log('event: %s -> callback: %o', vnode.attributes[name][0], vnode.attributes[name][1])
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
            node.appendChild(child)
        }

        return node;
    },

    renderDiff(dom, vdom) {
        console.log("renderDiff(dom: %o, vdom: %o)", dom, vdom)

        if (Array.isArray(vdom)) {
            console.log("compare dom with a vdom of multiple elements")
            for (let i = 0; i < Object.keys(vdom).length; i++) {
                let node = dom[i]
                let vnode = Object.keys(vdom)[i]
                //console.log(node)
                //console.log(vnode)
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
                    //console.log(root)
                    new_dom = woke.renderVDOM(new_vdom)
                    if (new_dom) {
                        root.innerHTML = ""
                        //console.log("new_dom: %o", new_dom)
                        if(Array.isArray(new_dom))
                        {
                            for(let i = 0; i < new_dom.length; i++)
                            {
                                //console.log("new_dom[%i]: %o", i, new_dom[i])
                                root.appendChild(new_dom[i])
                            }
                        }
                        else
                        {
                            root.appendChild(new_dom)
                        }
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
        renderLoop2()
    }
}
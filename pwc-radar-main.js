(function()  {
    class RadarComponent extends HTMLElement {
        arcId = 0;
        self = this;
        viewBoxSize = 1000;
        outerR = this.viewBoxSize / 2;
        outerC = 2 * Math.PI * this.outerR;
        width = 800;
        height =  800;
        sizeRatio = this.width / this.viewBoxSize
        textZoneSize = 120;
        _defaultZones =  [
            { backgroundColor: '#DA5269', size: 0.4 },
            { backgroundColor: '#e58696', size: 0.75 },
            { backgroundColor: '#eda9b4', size: 1 },
        ]
        _zones = this._defaultZones;
        _defaultSegments =  [
            { label: 'segment 1' },
            { label: 'segment 2' },
            { label: 'segment 3' },
        ]
        _segments = this._defaultSegments;
        _nodeR = 5;
        _nodeFill = "white";
        _nodeStroke = "black";
        _nodeStrokewidth = "1"
        _nodes = [];
        _backgroundColor = "transparent";

		constructor() {
			super(); 
            this._shadowRoot = this.attachShadow({mode: "open"});
            //this._shadowRoot.appendChild(tmpl.content.cloneNode(true));
            this._tagContainer;
            this.svg;
            this.container;
            this.selectedNode = null;
            document.addEventListener("propertiesChanged", function(e) {
                const rd = this.getElementById("radar");
                rd._segments = e.detail.properties.segmentList;
                rd._nodes = e.detail.properties.nodeList;
                rd.redraw();
                console.log(e.detail.properties.segmentList);
                // e.detail.properties.nodeList.forEach((newnode) => {
                //     _nodes.forEach((node) => {
                //         if(node.id == newnode.id) { //if node with same id already exists (name/x/y changed)
                //             node = newnode;
                //         }
                //     })
                // });
            });
		}

        constructHtml() {
            this._shadowRoot.innerHTML = `
            <style>
                :host div {
                    background-color: ${this._backgroundColor};
                }
                :host .arc {
                    fill: rgb(240,240,240);
                    stroke: transparent;
                    transition: fill .3s ease;
                }
                :host .arc:hover {
                    fill: #A21F1F;
                }
                :host .arc:hover + text {
                    fill: white;
                }
                :host text {
                    fill: #A21F1F;
                }
                :host g text {
                    fill: black;
                }
                :host .arc-active {
                    fill: #A21F1F;
                }
                :host .text-arc-active {
                    fill: white;
                }
            </style>
            `
        }


        //Fired when the widget is added to the html DOM of the page
        connectedCallback(){
            this._firstConnection = true;
        }

        attributeChangedCallback(name, oldValue, newValue) {
            console.log('Custom square element attributes changed.');
        }

         //Fired when the widget is removed from the html DOM of the page (e.g. by hide)
        disconnectedCallback(){
        
        }

         //When the custom widget is updated, the Custom Widget SDK framework executes this function first
		onCustomWidgetBeforeUpdate(oChangedProperties) {
		}

        //When the custom widget is updated, the Custom Widget SDK framework executes this function after the update
		onCustomWidgetAfterUpdate(oChangedProperties) {
            if (this._firstConnection){
                
            }
            this.redraw();
        }
        
        //When the custom widget is removed from the canvas or the analytic application is closed
        onCustomWidgetDestroy(){
        }

        //When the custom widget is resized on the canvas, the Custom Widget SDK framework executes the following JavaScript function call on the custom widget
        // Commented out by default.  If it is enabled, SAP Analytics Cloud will track DOM size changes and call this callback as needed
        //  If you don't need to react to resizes, you can save CPU by leaving it uncommented.
        /*
        onCustomWidgetResize(width, height){
        
        }
        */

        wtf(test = 'rr') {
            console.log(`wtf ${test}`);
        }

        get backgroundColor() {
            return this._backgroundColor;
        }
        
        set backgroundColor(value) {
            this._backgroundColor = value;
        }

        get segmentList() {
            return this._segments;
        }

        set segmentList(val) {
            let newVal;
            try {
                newVal = JSON.parse(val);
            } catch(e) {
                newVal = val;
                console.log(e);
            }

            return this._segments = newVal;
        }

        get nodeList() {
            return this._nodes;
        }

        set nodeList(val) {
            return this._nodes = val;
        }

        updateNode(i,node) {
            const nodeList = clone(this.nodeList);
            nodeList[i] = node;
            this.nodeList = nodeList;
        }
    
        addSegment(value) {
            this._segments.push({ label: value });
        }
        
        removeSegment(value) {
            this._segments = this._segments.filter(segment => segment.label !== value);
        }

        set zones(value) {
            this._zones = value;
        }
        get zones() {
            return this._zones;
        }

        construct() {
            this.constructHtml();
            this.constructSvg();
            this.constructArc();
            this.constructZones();
            this.constructNodes();
            
            this.constructSegmentDividers();
            
        }
        constructSvg() {
            this.container = document.createElement("div");
            this.container.setAttribute("style", `width: ${this.width}px; height: ${this.height}px; position: 'relative';`);

            this.svg  = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.svg.setAttribute("viewBox", `0 0 ${this.viewBoxSize} ${this.viewBoxSize}`);

            this.container.appendChild(this.svg);
            this._shadowRoot.appendChild(this.container);
        }

        constructZones(zones = this._zones) {
            const reversedZones = [...zones].reverse();
            reversedZones.forEach((zone,i) => {
                const newZone = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                const r = (this.viewBoxSize - this.textZoneSize) / 2 * zone.size;
                newZone.setAttribute("cx", this.viewBoxSize / 2);
                newZone.setAttribute("cy", this.viewBoxSize / 2);
                newZone.setAttribute("r", r);
                newZone.setAttribute("fill", zone.backgroundColor);
                this.svg.appendChild(newZone);
            })
        }

        constructNodes(nodes = this._nodes) {
            if (!nodes) {
                return;
            }
            nodes.forEach((node,i) => {
                const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                const newNode = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                newNode.setAttribute("cx", node.x);
                newNode.setAttribute("cy", node.y);
                newNode.setAttribute("r", this._nodeR);
                newNode.setAttribute("fill", this._nodeFill);
                newNode.setAttribute("stroke", this._nodeStroke);
                newNode.setAttribute("strokeWidth", this._nodeStrokewidth);
                g.setAttribute("style", `cursor: pointer`);
                g.appendChild(newNode);
                
                const newText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                newText.setAttributeNS(null,"x", node.x);
                newText.setAttributeNS(null,"y", node.y);
                newText.setAttributeNS(null,'font-size','30');

                const lbl = node.label;
                const lblNode = document.createTextNode(lbl);
                newText.appendChild(lblNode);
                g.appendChild(newText);
                
                setTimeout(() => {
                    const textLength = newText.getComputedTextLength();
                    node.textLength = textLength;
                    newText.setAttribute('transform',`translate(-${textLength / 2},30)`);
                });
                this.svg.appendChild(g);
                node.element = g;
                g.setAttributeNS(null, 'id', node.id);
                g.addEventListener('mousedown', e => {
                    if (!node.dragStartX && !this.selectedNode) {
                        this.selectedNode = node;
                        node.g = g;
                        const domRect = g.getBoundingClientRect();
                        console.log(domRect);
                        node.dragStartX = e.clientX;
                        node.dragStartY = e.clientY;
                        console.log(node);
                        document.addEventListener('mousemove', this.drag.bind(this));
                        g.addEventListener('mouseup', this.endDrag.bind(this,i,node));
                        return;
                    }
                });
            })
            
            
        }

        createNode(label = "name", x=900, y=100) {
            this._nodes.push({
                label: label,
                x,
                y,
                id: `radar-node-${this._nodes.length}`
            })
        }

        constructLabelZone(labels = this._segments) {
            const outerLabel = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            outerLabel.setAttribute("cx", this.outerR);
            outerLabel.setAttribute("cy", this.outerR);
            outerLabel.setAttribute("r", this.outerR);
            outerLabel.setAttribute("fill", "rgb(230,230,230)");
            this.svg.appendChild(outerLabel);
        }

        constructSegmentDividers(segments = this._segments) {
            const outerZoneR = (this.viewBoxSize - this.textZoneSize) / 2;
            segments.forEach((s,i) => {
                const angle = 360 / segments.length * i;
                const delta_x = this.outerR + (outerZoneR * Math.sin(degreesToRadians(angle)));
                const delta_y = this.outerR + (outerZoneR * Math.cos(degreesToRadians(angle)));
                const dottedLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
                const r = 10;
                dottedLine.setAttribute("x1", this.outerR);
                dottedLine.setAttribute("y1", this.outerR);
                dottedLine.setAttribute("x2", delta_x);
                dottedLine.setAttribute("y2", delta_y);
                dottedLine.setAttribute("stroke", "white");
                dottedLine.setAttribute("stroke-width", "5");
                dottedLine.setAttribute("stroke-dasharray", "0 10"); // 0 becouse linecap will render half circle from both sides making it look like a circle. 12 is white space
                dottedLine.setAttribute("stroke-linecap", "round");
                this.svg.appendChild(dottedLine);
            })
        }

        constructArc(segments = this._segments) {
            const arcDegree = 360 / segments.length;
            segments.forEach((s,i) => {
                let arc;
                let dy;
                const degreeStart = i * arcDegree;
                const degreeEnd = i * arcDegree + arcDegree;
                const degreeMid = (degreeStart + degreeEnd) / 2;

                // const angle = 360 / segments.length * i;
                const x1 = this.outerR + (this.outerR * Math.sin(degreesToRadians(degreeStart)));
                const y1 = this.outerR + (this.outerR * Math.cos(degreesToRadians(degreeStart)));
                const x2 = this.outerR + (this.outerR * Math.sin(degreesToRadians(degreeEnd)));
                const y2 = this.outerR + (this.outerR * Math.cos(degreesToRadians(degreeEnd)));

                const arcId = this.uniqueId('arc');
                if (degreeMid > 90 && degreeMid < 270) {
                    arc = this.createArc(x2,y2,x1,y1,1,arcId);
                    dy = this.textZoneSize / 3;
                } else {
                    arc = this.createArc(x1,y1,x2,y2,0,arcId);
                    dy = -0.5 * this.textZoneSize / 3;
                }
                
                const arcSize = this.outerC * arcDegree / 360;

                const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
                t.setAttributeNS(null,'font-size','30');
                t.setAttribute("width", "100");
                t.setAttributeNS(null,'letter-spacing',3);
                this.svg.appendChild(t);
                const tPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
                tPath.setAttributeNS(null,"href", `#${arcId}`);

                t.setAttributeNS(null,'dy', dy);
                t.appendChild(tPath);

                t.addEventListener("mouseenter", () => {
                    arc.classList.add('arc-active');
                    t.classList.add('text-arc-active');
                })
                t.addEventListener("mouseleave", () => {
                    arc.classList.remove('arc-active');
                    t.classList.remove('text-arc-active');
                }) 

                const lbl = s.label;
                const lblNode = document.createTextNode(lbl);
                tPath.appendChild(lblNode);
                setTimeout(() => {
                    const textBbox = tPath.getBBox();
                    const textWidth = textBbox.width;
                    t.setAttributeNS(null,"dx", arcSize / 2 - textWidth / 2 );
                }, 10);

            })

        }

        createArc(x1,y1,x2,y2,opp,arcId) {
            
            const arc = document.createElementNS("http://www.w3.org/2000/svg", "path");
            arc.setAttribute("d", `M${x1} ${y1} A${this.outerR} ${this.outerR}, 0, 0 ${opp}, ${x2} ${y2} L${this.outerR},${this.outerR} Z`);
            arc.setAttribute("stroke", "rgba(0,0,0,1)");
            arc.setAttribute("fill", "blue");
            arc.setAttribute("stroke-width", "3");
            arc.setAttribute("id", arcId);
            arc.classList.add('arc');
            this.svg.appendChild(arc);
            return arc;
        }

        redraw(){
            /*if (this.segments != null){
                if (this._tagContainer){
                    this._tagContainer.parentNode.removeChild(this._tagContainer);
                }
                this._tagContainer = document.createElement("div");  
                this._tagContainer.innerHTML = this._segments; 
                this._shadowRoot.appendChild(this._tagContainer);
            }*/

            if (this.container){
                this.container.parentNode.removeChild(this.container);
            }
            this.construct();
            
        }

        drag(e) {
            if (this.selectedNode) {
                this.selectedNode.g.setAttributeNS(null, "transform", `translate(${(e.clientX - this.selectedNode.dragStartX) / this.sizeRatio },${(e.clientY - this.selectedNode.dragStartY) / this.sizeRatio})`);
                //this.selectedNode.g.setAttributeNS(null, "transform", `translate(${(e.clientX) / this.sizeRatio },${(e.clientY) / this.sizeRatio})`);
            } 
        }
        endDrag(i,node,e) {
            if (this.selectedNode) {
                node.x = (e.offsetX) / this.sizeRatio + 0 //grap position x
                node.y = (e.offsetY) / this.sizeRatio + 0 //grap position y
                node.dragStartX = null;
                this.selectedNode = null;
                this.updateNode(i,node);
                this.redraw();
            }
        }

        uniqueId = (part = 'id') => {
            const id = `${part}${this.arcId++}`;
            const exist = document.querySelector(`#${id}`);
            if (exist) {
                return this.uniqueId(part);
            }
            return id;
        }
    };

    degreesToRadians = (degrees) => degrees * (Math.PI / 180);
    clone = (obj) => JSON.parse(JSON.stringify(obj));



    customElements.define('pwc-radar-main', RadarComponent);
        
})();
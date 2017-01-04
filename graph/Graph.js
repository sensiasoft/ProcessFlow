/*
    Copyright (c) 2015-2016 OpenSensorHub

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
*/
var Graph = function (_GLOBAL) {
    //INITIALIZE VARIABLES
    var scope = this;
    this._GLOBAL = _GLOBAL;
    this.Interop = new Interop();
    this.process;
    this.process_object = null;
    this.div = null;
    this.graph = null;
    this.directed_graph = null;
    this.paper = null;
    //this.component_graph = null;
    this.mousedown = false;
    this.currentMousePos = {x:0,y:0};
    this.linkJustAdded = false;
    this.linkJustRemoved = false;
    this.linkHovering = null;
    this.componentHovering = null;
    this.portHovering = null;
    this.portPos = null;
    this.dragStartPosition;
    
    this.ios = {inputs: [],outputs:[]};
    this.components = {};
    this.groups = {};
    
    this.requires_embedding = [];

    this.maps = {
        links: {}
    }

    this.leftovers = {
        components: {},
        links: [],
        ios: {}
    } //these are links that defined components and ports that don't exist
    
    this.binder = {};
    
    
    
    
    
    
    this.Group = {};
    this.Group.New = function (name) {
        if (typeof name === 'undefined' || name == '') return 'Please supply a valid name.';
        if (typeof scope.groups[name] !== 'undefined') return name + ' has already been used.';
        scope.components[name] = new Group(scope, name);
    }
    
    this.Component = {};
    this.Component.New = function (name, ports, isProcess,json,from_leftovers) {
        if (typeof name === 'undefined' || name == '') return 'Please supply a valid name.';
        if (typeof scope.components[name] !== 'undefined') return name + ' has already been used.';
        var properties = {
            x: (window.innerWidth - 500) * Math.random() + 250,
            y: (window.innerHeight - 500) * Math.random() + 250,
            name: name,
            from_leftovers: from_leftovers
        };
        
        if (typeof ports === 'object') {
            for (var port_type in ports) {
                properties[port_type] = ports[port_type];
            }
        }
        
        //attempt to split main process into in and out - directed graph algorithm sucks.. can only handle links to cells... not ports
        if(isProcess){
            var in_props = jQuery.extend(true,{},properties);
            in_props.name = in_props.name+'-IN';
            var out_props = jQuery.extend(true,{},properties);
            out_props.name = out_props.name+'-OUT';
            delete in_props.outputs;
            delete out_props.inputs;
            scope.components[in_props.name] = new Component(scope,in_props,isProcess);
            scope.components[out_props.name] = new Component(scope,out_props,isProcess);
            return;
        }
        
        //if json is undefined, it's because the processes are being created from the connections.. and cannot be retrieved from another source.
        var component = new Component(scope, properties, isProcess, json);
        scope.components[name] = component;


        return component;
    }
    this.Component.Add_Port = function (component, type, name, from_leftovers) {
        if(component==scope.process){
            if(type=='outputs') component = component+'-OUT';
            if(type=='inputs') component = component+'-IN';
        }
        if (typeof scope.components[component] === 'undefined') return;// console.log(component+' is UNDEFINED\n'+type);
//        if(from_leftovers) console.log(component+': '+name+' is from Leftovers');
//        if(!from_leftovers) console.log(component+': '+name+' is NOT from Leftovers');
        scope.components[component].Add.Port(type, name, from_leftovers);
    }
    this.Component.Add_DataRecord = function (component, port, name) {
        if(component==scope.process) component = component+'-OUT';
        if (typeof scope.components[component] === 'undefined') return;// console.log(component+' is UNDEFINED\n'+type);
        scope.components[component].Add.DataRecord(port, name);
    }
    this.Component.Add_Link = function (from, from_type, to, to_type,properties) {
        var from_comp = from.split('.')[0];
        var from_port = from.split('.')[1];
        var to_comp = to.split('.')[0];
        var to_port = to.split('.')[1];

//        console.log('~~~~~~~~~~~~~~~~~~~');
//        console.log('From: '+from_comp+' - '+from_type+' - '+from_port);
//        console.log('To  : '+to_comp+' - '+to_type+' - '+to_port);
//        console.log('~~~~~~~~~~~~~~~~~~~');
        
//        if(from_comp==scope.process){
//            if(from_type=='inputs') from_comp = from_comp+'-IN';
//            if(from_type=='outputs') from_comp = from_comp+'-OUT';
//        }
//        if(to_comp==scope.process){
//            if(to_type=='inputs') to_comp = to_comp+'-IN';
//            if(to_type=='outputs') to_comp = to_comp+'-OUT';
//        }
        
        //The ports should have already been added by now..... I think ???????????? This is the whole basis for determining if they were generated from the connections
        if(scope.components[from_comp] && !scope.components[from_comp].ports[from_port]) scope.Component.Add_Port(from_comp,from_type,from_port, true);
        if(scope.components[to_comp] && !scope.components[to_comp].ports[to_port]) scope.Component.Add_Port(to_comp,to_type,to_port,true);
        
        
        var good = true;
        if (!scope.components[from_comp]) {
            if (!scope.leftovers.components[from_comp]) scope.leftovers.components[from_comp] = {
                inputs: [],
                outputs: [],
                parameters: []
            };
            scope.leftovers.components[from_comp][from_type].push(from_port);
            good = false;
        }
        if (!scope.components[to_comp]) {
            if (!scope.leftovers.components[to_comp]) scope.leftovers.components[to_comp] = {
                inputs: [],
                outputs: [],
                parameters: []
            };
            scope.leftovers.components[to_comp][to_type].push(to_port);
            good = false;
        }
        if (!good) {
            scope.leftovers.links.push({
                from: from,
                from_type: from_type,
                to: to,
                to_type: to_type,
            });
            return;
        }
        scope.components[from_comp].Add.Link(from_port, to,properties);
    }
    this.Component.LeftOvers = function (callback) {
        var leftovers = jQuery.extend(true, {}, scope.leftovers);
        scope.leftovers = {};
        for (var component in leftovers.components) {
            if(component == scope.process) continue;
            //console.log(leftovers.components[component]);
            var json;
            scope.Component.New(component, leftovers.components[component],json,false,true);
            scope.components[component].Modify.Component_Color('#FF9933');
        }
//        var properties = {
//            color: '#FF9933'
//        }
        //Don't think there's a need to color the links anything other than blue.. they're not being created by anything except the original XML
        for (var i = 0; i < leftovers.links.length; i++) {
            var link_obj = leftovers.links[i];
            scope.Component.Add_Link(link_obj.from, link_obj.from_type, link_obj.to, link_obj.to_type/*,properties*/);
            
        }
        if(callback) callback();
    }
    this.Component.Select = function (name) {
        //console.log('"' + name + '" was clicked');
        scope._GLOBAL.Menu.Component(name);
    }
    this.Component.Remove = function (name) {
        //Traverse links and nodes and remove all
        scope.components[name].component.remove();
        scope.components[name]._componentRemoved();
        delete scope.components[name];
    }

    this.InOut = {};
    this.InOut.New = function (name, type) {
        if (typeof name === 'undefined' || name == '') return 'Please supply a valid name.';
        if (typeof scope.components[name] !== 'undefined') return name + ' has already been used.';
        var x = 100;
        if (type == 'outputs') x = window.innerWidth - 200;
        var properties = {
            x: x,
            y: (window.innerHeight - 500) * Math.random() + 250,
            name: name,
            io: true,
            io_type: type
        };
        var component = new Component(scope, properties)
        scope.components[name] = component;

        var port_type = 'inputs';
        if (type == 'inputs') port_type = 'outputs';

        setTimeout(function () {
            scope.components[name].Add.Port(port_type, name);
        }, 100);
        scope.ios[type].push(name);


        return 9999;
    }

    this.Directed_Graph = function () {
        //return;
        var result = joint.layout.DirectedGraph.layout(scope.graph, {
            setLinkVertices: false,
            rankDir: 'LR',
            rankSep: 150,
            marginX: 50,
            marginY: 50,
            clusterPadding: {
                top: 30,
                left: 10,
                right: 10,
                bottom: 10
            }
        });
    }

    scope.Menu = {};
    this.Menu.Open = function(){
        $(".ui-dialog-content").dialog("close");
        var xml = scope._rewrite_HTML();
        if(!xml) return;
        var html = '<div id="graph-editor" title="Graph Properties">';
        html = html + '<div id="graph-XML" style="height:700px;overflow:auto;border-style: solid;">'+xml+'</div>';
        html = html + '</div>';
        $('body').append(html);
        $('#graph-editor').dialog();
        $('#graph-editor').dialog( "option", "height", 800 );
        $('#graph-editor').dialog( "option", "width", 800 );
        $('.ui-dialog :button').blur();
        $('#graph-editor').on('dialogclose', function(event) {
            $('#graph-editor').remove();
        });
        $('#graph-XML').resizable();
    }
    this.Menu.Close = function(){
        $('#graph-editor').hide();
        $('#graph-editor').remove();
        
    }
    
    this._finished_loading = function(){
        
        
    }
    
    this._rewrite_HTML = function(){
        if(!scope.json) return;
        var xml = '';
        xml = json2xml(JSON.stringify(jQuery.extend(true,{},scope.json)));
        xml = formatXml(xml);
        xml = xml.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/ /g, '&nbsp;').replace(/\n/g,'<br />');
        if(($('#graph-editor')).length != 0 ) $('#graph-XML').html(xml);
        return xml;
    }

    this._goodConnectionQ = function (source_component, target_component, source_port, target_port) {
        if (source_component == target_component) return false;
        var link_name = source_component + '.' + source_port + ':' + target_component + '.' + target_port;
        if (scope.components[source_component]._linkExistsQ(link_name) || scope.components[target_component]._linkExistsQ(link_name)) return false;
        return true;

    }

    //INIT
    $(document).ready(function () {
        
        Create_Paper(scope,'paper-main');
        
        
        
        
        document.body.onmousedown = function (e) {
            scope.mousedown = true;
        }
        document.body.onmouseup = function () {
            scope.mousedown = false;
        }
        $(document).mousemove(function(event) {
            scope.currentMousePos.x = event.pageX;
            scope.currentMousePos.y = event.pageY;
        });
        $("body").on("contextmenu",function(){
           return false;
        });
    });
}


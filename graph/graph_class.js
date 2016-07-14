var Graph = function (process_object) {
    //INITIALIZE VARIABLES
    var scope = this;
    this.process = null;
    this.process_object = process_object;
    this.graph = new joint.dia.Graph;
    this.paper = new joint.dia.Paper({
        el: $('#paper-create'),
        width: window.innerWidth * 0.99,
        height: window.innerHeight * 0.99,
        gridSize: 1,
        model: scope.graph
    });

    //DEFINE CLASS FUNCTIONS
    this.Models = {};
    this.Models.Create = function () {
        if (typeof scope.process_object === 'undefined') return console.log('"process_object" undefiend');
        //Main outer loop - this will be some sort of process that contains all the subsequent components
        var cnt1 = 0;
        for (var proc in scope.process_object) {
            if (cnt1 == 1) break; //There should only be one Process - future implementations will store graphs in outer nodes so we can visualize the entire network.
            scope.process = proc;
            var process_group = Models.Process(proc);
            scope.graph.addCell(process_group);
            if (typeof scope.process_object[proc].inputs === 'object') scope._create_IO_models(process_group, scope.process_object[proc].inputs, 'In');
            if (typeof scope.process_object[proc].outputs === 'object') scope._create_IO_models(process_group, scope.process_object[proc].outputs, 'Out');
            //Components are treated differently - they'll be nodes with their own inputs/outputs
            if (typeof scope.process_object[proc].components === 'object') scope._create_component_models(process_group, scope.process_object[proc].components);
            cnt1++;
        }
    }
    this.Models.Connect = function () {
        /*
        This section is greatly subjective... it's hard-coded to the current SensorML 2.0 configuration
        Any tweak of the schema could throw this off. As the structure becomes more understood, I'd like to
        automate the tree traversal.
        */
        var connections = scope.process_object[scope.process].connections;
        if (typeof connections !== 'object' || connections.length == 0) return console.log('WARNING: No connections found.');
        for (var connection in connections) {
            var link_object = {};
            for (var srcORdst in connections[connection]) {
                var link_target = 'source';
                if (srcORdst == 'destination') link_target = 'target';
                var string_list = connections[connection][srcORdst].split('/');
                if(string_list.length==2){
                    var mod = scope.process_object[scope.process][string_list[0]][string_list[1]]._model;
                }else{
                    var mod = scope.process_object[scope.process][string_list[0]][string_list[1]][string_list[2]][string_list[3]]._model;
                }
                link_object[link_target] = mod;
            }
            var link = new joint.shapes.devs.Link(link_object);
            scope.graph.addCell(link);
        }
    }
    this.Models.DirectedGraph = function () {
        joint.layout.DirectedGraph.layout(scope.graph, {
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
        scope._constraints();
//        scope.Models.Style();
//        scope.Models.Text_Nodes();
    }
    this.Models.Style = function () {
        var parameter_color = '#66ff33';
        var nonValue_color = '#ffffff';
        var components = scope.process_object[scope.process].components;
        for(var component in scope.process_object[scope.process].components){
            var parameters = components[component].parameters;
            if(typeof parameters !== 'undefined'){
                for(var parameter in parameters){
                    if(typeof parameters[parameter].value !== 'undefined'){
                        //it has a value - must change the port to take values and add event handler
                        var mod = components[component]._model;
                        var attr = {};
                        attr['[port="'+parameter+'"]'] = {fill:parameter_color};
                        mod.attr(attr);
                    }
                }
            }
//            var inputs = components[component].inputs;
//            for(var input in inputs){
//                if(!inputs[input]._connected){
//                    var attr = {};
//                    attr['[port="'+parameter+'"]'] = {fill: nonValue_color}
//                    mod.attr(attr);
//                }
//            }
            var outputs = components[component].outputs;
            for(var output in outputs){
                if(!outputs[output]._connected){
                    var attr = {};
                    attr['[port="'+output+'"]'] = {fill: nonValue_color}
                    mod.attr(attr);
                }
            }
        }
    }
    this.Models.Text_Nodes = function () {
        var components = scope.process_object[scope.process].components;
        for(var component in scope.process_object[scope.process].components){
            var parameters = components[component].parameters;
            if(typeof parameters !== 'undefined'){
                for(var parameter in parameters){
                    if(typeof parameters[parameter].value !== 'undefined'){
                        //var input_box = '<input id="parameter_input_'+parameter+'" type="text" value="'+parameters[parameter].value+'"></input>';
                        
                        //will have to change from port to a custom html element and create a new group surrounding it
                        
                        var input_box = '<foreignObject x="50" y="50" width="200" height="150"><body xmlns="http://www.w3.org/1999/xhtml"><form><input type="text" value="hello world"/></form></body></foreignObject>';
                        $('.rotatable')
                            .filter(':contains("'+component+'")')
                            .find('.inPorts')
                            .find('.port')
                            .filter(':contains("'+parameter+'")')
                            .find('circle')
                            .html(input_box);
                    }
                }
            }
        }
    }

    //HELPER FUNCTIONS - NOT MEANT TO BE PART OF MAIN CLASS
    this._create_group_model = function (parent_grp, io_object, model_type, group_name) {
//        var local_group = Models.Process(group_name);
//        scope.graph.addCell(local_group);
        for (var variable in io_object) {
            io_object[variable]._model = Models[model_type](variable);
            scope.graph.addCell(io_object[variable]._model);
//            local_group.embed(io_object[variable]._model);
            parent_grp.embed(io_object[variable]._model);
        }
//        if (typeof parent_grp !== 'undefined') parent_grp.embed(local_group);
    }
    this._create_IO_models = function (grp, io_object, io) {
        for (var variable in io_object) {
            io_object[variable]._model = Models[io](variable);
            scope.graph.addCell(io_object[variable]._model);
            if (typeof grp !== 'undefined') grp.embed(io_object[variable]._model);
        }
    }
    this._create_component_models = function (grp, comps) {
        for (var comp in comps) {
            //function (name, inputs, outputs, x, y, width, height)
            //For now, we are making parameters a part of inputs... They may be isolated models similar to the parent's inputs/outputs - undecided at this point
            var inputs = [];
            var outputs = [];
            var parameters = [];
            var comp_group = Models.Process(comp);
            scope.graph.addCell(comp_group);
            if (typeof comps[comp].inputs !== 'undefined') scope._create_group_model(comp_group, comps[comp].inputs, 'component.input','INPUTS');
            if (typeof comps[comp].outputs !== 'undefined') scope._create_group_model(comp_group, comps[comp].outputs, 'component.output','OUTPUTS');
            if (typeof comps[comp].parameters !== 'undefined') scope._create_group_model(comp_group, comps[comp].parameters, 'component.parameter','PARAMETERS');
            if (typeof grp !== 'undefined') grp.embed(comp_group);
        }
    }
    this._locate_port = function (name) {
        var list = $('circle');
        for (var port in list) {
            if ($(list[port]).attr('port') == name)
                return $(list[port]);
        }
    }
    //This function constrains each element inside their own parent object
    this._constraints = function () {
        scope.graph.on('change:size', function (cell, newPosition, opt) {
            if (opt.skipParentHandler) return;
            if (cell.get('embeds') && cell.get('embeds').length) {
                cell.set('originalSize', cell.get('size'));
            }
        });
        scope.graph.on('change:position', function (cell, newPosition, opt) {
            if (opt.skipParentHandler) return;
            if (cell.get('embeds') && cell.get('embeds').length) cell.set('originalPosition', cell.get('position'));
            var parentId = cell.get('parent');
            if (!parentId) return;
            var parent = scope.graph.getCell(parentId);
            var parentBbox = parent.getBBox();
            if (!parent.get('originalPosition')) parent.set('originalPosition', parent.get('position'));
            if (!parent.get('originalSize')) parent.set('originalSize', parent.get('size'));
            var originalPosition = parent.get('originalPosition');
            var originalSize = parent.get('originalSize');
            var newX = originalPosition.x;
            var newY = originalPosition.y;
            var newCornerX = originalPosition.x + originalSize.width;
            var newCornerY = originalPosition.y + originalSize.height;
            _.each(parent.getEmbeddedCells(), function (child) {
                var childBbox = child.getBBox();
                if (childBbox.x < newX) newX = childBbox.x;
                if (childBbox.y < newY) newY = childBbox.y;
                if (childBbox.corner().x > newCornerX) newCornerX = childBbox.corner().x;
                if (childBbox.corner().y > newCornerY) newCornerY = childBbox.corner().y;
            });
            parent.set({
                position: {
                    x: newX,
                    y: newY
                },
                size: {
                    width: newCornerX - newX,
                    height: newCornerY - newY
                }
            }, {
                skipParentHandler: true
            });
        });
    }
}
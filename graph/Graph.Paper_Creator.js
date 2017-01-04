var Create_Paper = function (scope,div) {
    //Save recent paper to binder
    if(scope.div!=null){
        scope.binder[scope.div] = {
            graph: jQuery.extend(true,{},scope.graph),
            directed_graph: jQuery.extend(true,{},scope.directed_graph),
            paper: jQuery.extend(true,{},scope.paper)
        }
        $('#'+scope.div).hide();
    }
    
    
    $('body').append('<div id="'+div+'"></div>');
    scope.div = div;
    
    
    scope.graph = new joint.dia.Graph;
    scope.directed_graph = new joint.dia.Graph;
    scope.paper = new joint.dia.Paper({
        el: $('#'+div),
        width: window.innerWidth * 0.99,
        height: window.innerHeight * 0.99,
        gridSize: 1,
        model: scope.graph,
        snapLinks: true
    });

    var paper = scope.paper;
    paper.on('blank:pointerdown',
        function (event, x, y) {
            scope.dragStartPosition = {
                x: x,
                y: y
            };
        }
    );
    paper.on('cell:pointerup blank:pointerup', function (cellView, x, y) {
        delete scope.dragStartPosition;
    });
    $("#"+div).mousemove(function (event) {
        if (scope.dragStartPosition) paper.setOrigin(event.offsetX - scope.dragStartPosition.x, event.offsetY - scope.dragStartPosition.y);
    });

    scope.graph.on('change:source change:target', function (link) {
        if (link.get('source').id && link.get('target').id) {
            // both ends of the link are connected.
            scope.linkJustAdded = true;
            setTimeout(function () {
                scope.linkJustAdded = false;
            }, 200)
        }
    });
    $(document).keydown(function (e) {
        if (e.ctrlKey) {
            if (scope.linkHovering != null) {
                var component = scope.linkHovering.split(':')[0].split('.')[0];
                scope.components[component].links[scope.linkHovering].Menu.Open();
            } else if (scope.portHovering != null) {
                scope.components[scope.componentHovering].Tree.Open(scope.portHovering);
            } else if (scope.componentHovering != null) {
                scope.components[scope.componentHovering].Menu.Open();
            } else {
                //Must be on the overall graph
                console.log('CNTRL DOWN')
                scope.Menu.Open();
            }
        }
    });
    $(document).keyup(function (e) {
        if (scope._GLOBAL.Menu.coloring) scope._GLOBAL.Menu.Init();
    });
    scope.paper.on('cell:mouseover',
        function (cellView, evt, x, y) {
            if (typeof cellView.sourceView !== 'undefined') { //link
                var link_name = scope.maps.links[cellView.model.id];
                var source_component = link_name.split(':')[0].split('.')[0];
                var source_port = link_name.split(':')[0].split('.')[1];
                var target_component = link_name.split(':')[1].split('.')[0];
                var target_port = link_name.split(':')[1].split('.')[1];
                scope.linkHovering = link_name;
            } else { //it's a component
                var component = cellView.model.attributes.attrs['.label'].text;
                scope.componentHovering = component;
            }
        }
    );
    scope.paper.on('cell:mouseout',
        function (cellView, evt, x, y) {
            scope.linkHovering = null;
            scope.componentHovering = null;
        }
    );


    scope.paper.on('cell:pointerup',
        function (cellView, evt, x, y) {
            if (scope.linkJustRemoved) return;

            //NOTE: when the pointer creates a link, it cannot access the node below it... this will only ever fire components and links
            if (typeof cellView.sourceView !== 'undefined') { //link
                var source_component = cellView.sourceView.model.attributes.attrs['.label'].text;
                if (cellView.targetView == null) {
                    cellView.remove();
                    return;
                }
                var target_component = cellView.targetView.model.attributes.attrs['.label'].text;
                //the port does not exist if the link already exists... only port selectors, which are maps to css functions... huge flaw for jointjs. needs work-around.
                var source_port = cellView.model.get('source').port;
                var target_port = cellView.model.get('target').port;

                if (!scope._goodConnectionQ(source_component, target_component, source_port, target_port)) {
                    if (scope.linkJustAdded) cellView.remove();
                    return;
                }

                if (scope.maps.links[cellView.model.id]) { //link already mapped
                    scope._GLOBAL.Menu.Component(source_component);
                    return;
                }
                var link_name = source_component + '.' + source_port + ':' + target_component + '.' + target_port;
                console.log('Link: ' + source_component + '.' + source_port + ' ---> ' + target_component + '.' + target_port);
                //console.log('Link: ' + source_component + '.' + source_port + ' ---> ' + target_component + '.' + target_port);
                var link_name = source_component + '.' + source_port + ':' + target_component + '.' + target_port;
                cellView.model.set('router', {
                    name: 'metro'
                });
                cellView.model.set('connector', {
                    name: 'rounded'
                });
                var new_link = new Link(cellView.model, scope);
                new_link.Color('#FF0000');
                scope.components[source_component].links[link_name] = new_link;
                scope.components[target_component].links[link_name] = new_link;
                scope._GLOBAL.Menu.selected = null;
                scope._GLOBAL.Menu.Component(source_component);
                scope.maps.links[cellView.model.id] = link_name;
                scope.Directed_Graph();
                //only need to perform _linkAdded from one component
                scope.components[source_component]._linkAdded(link_name);
            } else {
                var component = cellView.model.attributes.attrs['.label'].text;
                //scope.Component.Select(component);
            }


        }
    );

    scope.graph.on('remove', function (cellView, collection, opt) {
        if (cellView.isLink()) {
            // a link was removed  (cell.id contains the ID of the removed link)
            scope.linkJustRemoved = true;
            setTimeout(function () {
                scope.linkJustRemoved = false;
            }, 200);
            var link_name = scope.maps.links[cellView.id];
            if (typeof link_name === 'undefined') return;
            var from = link_name.split(':')[0].split('.')[0];
            var to = link_name.split(':')[1].split('.')[0];
            console.log(from);
            console.log(to);
            delete scope.components[from].links[link_name];
            delete scope.components[to].links[link_name];
            scope._GLOBAL.Menu.selected = null;
            scope._GLOBAL.Menu.Component(from);
            scope.Directed_Graph();
            //only need to perform _linkRemoved from one component
            scope.components[from]._linkRemoved(link_name);
        } else {
            //scope.component_graph.removeCells([cellView]);
        }
    });



    scope.graph.on('change:position', function (cell, newPosition, opt) {
        if (opt.skipParentHandler) return;
        if (cell.get('embeds') && cell.get('embeds').length) cell.set('originalPosition', cell.get('position'));
        var parentId = cell.get('parent');
        if (scope.components[cell._componentName]) scope.components[cell._componentName]._componentMoved(newPosition); //update the json
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
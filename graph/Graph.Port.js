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
var Port = function (_parent, name, type, css_link, from_leftovers) {
    var scope = this;
    this._parent = _parent;
    this._GLOBAL = _parent._GLOBAL;
    var colors = {
        inputs: '#00FF00',
        outputs: '#FF0000',
        parameters: '#FFFFFF'
    }
    this.name = name;
    this.type = type;
    this.id = 'port:'+type+'.'+name;
    this.css_link = css_link;
    this.type = type;
    this.color = colors[type];
    
    
    this.Stroke = {}
    this.Stroke.Color = function(color){
        var id = scope._parent.component.id;
        var port_type = 'outPorts';
        if(scope.type=='inputs' || scope.type=='parameters') port_type = 'inPorts';
        var circle = $('[model-id="'+id+'"] .'+port_type+' .port circle[port="'+scope.name+'"]')
        circle.attr('stroke',color);
        if(!scope._parent.port_color_assignments[scope.name]) scope._parent.port_color_assignments[scope.name] = {type:scope.type};
        //if(!scope._parent.port_color_assignments[scope.name].circle) scope._parent.port_color_assignments[scope.name].circle = circle;
        scope._parent.port_color_assignments[scope.name].color = color;
    }
    this.Stroke.Thickness = function(thickness){
        var id = scope._parent.component.id;
        var port_type = 'outPorts';
        if(scope.type=='inputs' || scope.type=='parameters') port_type = 'inPorts';
        var circle = $('[model-id="'+id+'"] .'+port_type+' .port circle[port="'+scope.name+'"]')
        circle.attr('stroke-width',thickness);
        if(!scope._parent.port_color_assignments[scope.name]) scope._parent.port_color_assignments[scope.name] = {type:scope.type};
        //if(!scope._parent.port_color_assignments[scope.name].circle) scope._parent.port_color_assignments[scope.name].circle = circle;
        scope._parent.port_color_assignments[scope.name].thickness = thickness;
    }
    this.Color = function(color){
        scope._parent.component.attr(scope.css_link + ' circle/fill', color);
        scope.color = color;
    }
    this.MoveTo = function(x,y){
        scope._parent.component.attr(scope.css_link + '/ref-x', refx);
        scope._parent.component.attr(scope.css_link + '/ref-y', refy);
    }
    
    scope._parent.component.attr(css_link + ' circle/fill', colors[type]);
    
    if(type=='parameters') scope._parent.component.attr(css_link + ' text/transform', 'rotate(-90)');
    
    if(from_leftovers){
        setTimeout(function(){
            var id = scope._parent.component.id;
            var port_type = 'outPorts';
            if(scope.type=='inputs' || scope.type=='parameters') port_type = 'inPorts';
            var circle = $('[model-id="'+id+'"] .'+port_type+' .port circle[port="'+scope.name+'"]')
            circle.attr('stroke','#FF9933');
            circle.attr('stroke-width','0.25em');
        },500);
    }
    
    
    
}
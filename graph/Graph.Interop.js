var Interop = function(){
    var scope = this;
    this.originating_Interop;
    this.open_window;
    
    //FROM ORIGINATOR
    this.Open_Window = function(){
        var w = window.innerWidth;
        var h = window.innerHeight;
        if(!scope.open_window || (scope.open_window && scope.open_window.closed)) scope.open_window = window.open("index.html", "", "width="+w+",height="+h);
        var after_load = function(){
            scope.open_window.API.Graph.Interop.Set_Originating_Interop(scope);
        }
        scope.open_window.addEventListener('load', after_load, false);
    }
    this.Set_Originating_Interop = function(originating_Interop){
        scope.originating_Interop = originating_Interop;
    }
    this.Update = function(msg){
        $('#editing').html(msg);
    }
    
    //FROM CHILD
    this.Update_Originating_Interop = function(string_function){
        if(!scope.originating_Interop) return;
        scope.originating_Interop.Update(string_function);
    }
}
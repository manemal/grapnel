
/****
 * @package Grapnel.js
 * A lightweight JavaScript library for adding action hooks in URL hashtags/anchors.
 * https://github.com/gregsabia/Grapnel-js 
 * 
 * @author Greg Sabia
 * @support http://gregsabia.com
 * 
 * Event listeners: ['ready', 'match', 'hashchange']
*/

var Grapnel = function(hook){
    var self = this;
    this.action = null;
    // Hook (default: ":")
    this.hook = hook || ':';
    // Value (default: null)
    this.value = null;
    // Actions
    this.actions = [];
    // Listeners
    this.listeners = [];
    /**
     * Add an event listener
     * 
     * @param {String|Array} event
     * @param {Function} callback
    */
    this.on = function(event, handler){
        var events = (typeof event == 'string') ? event.split() : event;
        // Add listeners
        events.map(function(event){
            self.listeners.push({ event : event, handler : handler });
        });

        return this._run();
    }
    // Fire a listener
    this._trigger = function(event){
        var params = Array.prototype.slice.call(arguments, 1);

        this.listeners.map(function(listener){
            if(listener.event == event) listener.handler.apply(self, params);
        });

        return this;
    }
    // Get anchor
    this.getAnchor = function(){
        return (window.location.hash) ? window.location.hash.split('#')[1] : '';
    }
    // Change anchor
    this.setAnchor = function(anchor){
        window.location.hash = (!anchor) ? '' : anchor;
        return this;
    }
    // Reset anchor
    this.clearAnchor = function(){
        return this.setAnchor(false);
    }
    // Parse hook
    this.parse = function(){
        var action, value;

        if(this.getAnchor().match(this.hook)){
            // Found a hook!
            value = this.getAnchor().split(this.hook)[1];
            action = this.getAnchor().split(this.hook)[0];
        }

        return {
            value : value,
            action : action
        };
    }
    /**
     * Add an action and handler
     * 
     * @param {String} action name
     * @param {Function} callback
    */
    this.add = function(name, handler){
        this.actions.push({ name : name, handler : handler });
        return this._run();
    }
    // Return matched actions
    this.matches = function(){
        var matches = [];

        this.actions.map(function(action){
            if(action.name == self.action) matches.push(action);
        });

        return matches;
    }
    // Run hook action
    this._run = function(){
        // Parse Hashtag in URL
        this.action = this.parse().action;
        this.value = this.parse().value;
        // If a match is found, trigger event
        if(this.matches().length > 0) this._trigger('match', this.value, this.action);
        // Run handlers matching current anchor
        this.matches().map(function(action){
            action.handler.call(self, self.value, self.action);
        });

        return this;
    }
    // Default anchor change event
    this.on(['ready', 'hashchange'], this._run);

    // Check current hash change event
    if(typeof window.onhashchange == 'function') this.on('hashchange', window.onhashchange);
    /**
     * Hash change event
     * TODO: increase browser compatibility. "window.onhashchange" can be supplemented in older browsers with setInterval()
    */
    window.onhashchange = function(){
        self._trigger('hashchange', self.getAnchor());
    }
    // Initialize
    this._trigger('ready', this);

    return this;
}

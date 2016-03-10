/*
 * L.TileLayer is used for standard xyz-numbered tile layers.
 * Author: Hu Chia Wei
 * Date: 2016.3.10
 * Email: Kenneth.hu@hotmail.com
 */
 L.BMap = L.Class.extend({
	includes: L.Mixin.Events,
	
	options:{
		minZoom: 0,
		maxZoom: 18,
		tileSize: 256,
		subdomains:'kenneth',
		errorTileUrl:'',
		attribution:'',
		opacity:1,
		continuousWorld:false,
		noWrap: false,
	},
	//possible types: 
	initialize: function(type,options){
		L.Util.setOptions(this, options);
		
		this._type ="coordinate";
	},
	onAdd: function(map, insertAtTheBottom){
		this._map=map;
		this._insertAtTheBottom = insertAtTheBottom;
		
		//create a container div for tileSize
		this._initContainer();
		this._initMapObject();
		
		//set up events
		map.on('viewreset', this._resetCallback, this);
		
		this._limitedUpdate = L.Util.limitExecByInterval(this._update, 150, this);
		map.on('move', this._update, this);
		
		 this._reset();
		 this._update();
	},
	
	onRemove: function(map){
		this._map._container.removeChild(this._container);
		
		this._map.off('viewreset', this._resetCallback, this);
		
		this._map.off('move', this._update, this);
	},
	
	getAttribution: function(){
		return this.options.attribution;
	},
	
	setOpacity: function(opacity){
		this.options.opacity = opacity;
		if(opacity <1){
			L.DomUtil.setOpacity(this._container, opacity);
		}
	},
	
	_initContainer: function(){
		var tilePane = this._map._container,
			first = tilePane.firstChild;
			
		if(!this._container){
			this._container = L.DomUtil.create('div', 'leaflet-baidu-layer leaflet-top leaf-left');
			this._container.id = "_QMapContainer";
		}
		
		if(true){
			tilePane.insertBefore(this._container, first);
			
			this.setOpacity(this.options.opacity);
			var size = this._map.getSize();
			this._container.style.width = size.x +'px';
			this._container.style.height = size.y + 'px';
		}
	},
	
	
	_initMapObject: function(){
		this._BMap_center = new BMap.Point(0, 0);
		var map = new BMap.Map(this._container,{
			center:this._BMap_center,
			zoom:0,
			disableDefaultUI: true,
			keyboardShortcuts: false,
			draggable: false,
			disableDoubleClickZoom: true,
			scrollwheel: false,
			streeViewControl: false
		});
		
		var _this = this;
		this._reposition = map.addEventListener( "center_changed",
			function(){
				_this.onReposition();
			});
			
		map.backgroundColor = '#FBF8F8';
		this._BMap = map;
	},
	
	_resetCallback: function(e){
		this._reset(e.hard);
	},
	
	_reset: function(clearOldContainer){
		this._initContainer();
	},
	
	_update:function(){
		this._resize();
		
		var center = this._map.getCenter();
		var _center = new BMap.Point(center.lat, center.lng);
		
		 this._BMap.centerAndZoom(new BMap.Point(center.lng, center.lat), this._map.getZoom());
		 this._BMap.checkResize();
		
	},
	
	_resize: function() {
		var size = this._map.getSize();
		if (this._container.style.width == size.x &&
		    this._container.style.height == size.y)
			return;
		this._container.style.width = size.x + 'px';
		this._container.style.height = size.y + 'px';
		 this._BMap.checkResize();
	},
	
 })